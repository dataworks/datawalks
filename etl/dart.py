#Charles Wild

# Imports
import os
import re
import shutil
import sys
import urllib
import argparse
from getpass import getpass
import json

# Mechanize must be written as me as indicated by Magsol, changing results in un-indicated errors. 
import mechanize as me

# Base URL input to Garmin Connect.
BASE_URL = "http://connect.garmin.com/en-US/signin"
GAUTH = "http://connect.garmin.com/gauth/hostname"
SSO = "https://sso.garmin.com/sso"
CSS = "https://static.garmincdn.com/com.garmin.connect/ui/css/gauth-custom-v1.1-min.css"

# magsol code indicates redirect is needed for new Garmin API.
REDIRECT = "https://connect.garmin.com/post-auth/login"

# The %s is associated number with specific user activity.  
ACTIVITIES = "http://connect.garmin.com/proxy/activity-search-service-1.2/json/activities?start=%s&limit=%s"
TCX = "https://connect.garmin.com/proxy/activity-service-1.1/tcx/activity/%s?full=true"
GPX = "https://connect.garmin.com/proxy/activity-service-1.1/gpx/activity/%s?full=true"
KML = "https://connect.garmin.com/proxy/activity-service-1.0/kml/activity/%s?full=true"
CSV = "https://connect.garmin.com/csvExporter/%s.csv"

def login(agent, username, password):
    global BASE_URL, GAUTH, REDIRECT, SSO, CSS

    # First establish contact with Garmin and decipher the local host.
    page = agent.open(BASE_URL)
    pattern = "\"\S+sso\.garmin\.com\S+\""
    script_url = re.search(pattern, page.get_data()).group()[1:-1]
    agent.open(script_url)
    hostname_url = agent.open(GAUTH)
    hostname = json.loads(hostname_url.get_data())['host']

    # Package the full login GET request...
    data = {'service': REDIRECT,
        'webhost': hostname,
        'source': BASE_URL,
        'redirectAfterAccountLoginUrl': REDIRECT,
        'redirectAfterAccountCreationUrl': REDIRECT,
        'gauthHost': SSO,
        'locale': 'en_US',
        'id': 'gauth-widget',
        'cssUrl': CSS,
        'clientId': 'GarminConnect',
        'rememberMeShown': 'true',
        'rememberMeChecked': 'false',
        'createAccountShown': 'true',
        'openCreateAccount': 'false',
        'usernameShown': 'false',
        'displayNameShown': 'false',
        'consumeServiceTicket': 'false',
        'initialFocus': 'true',
        'embedWidget': 'false',
        'generateExtraServiceTicket': 'false'}

    # ...and officially say "hello" to Garmin Connect.
    login_url = 'https://sso.garmin.com/sso/login?%s' % urllib.urlencode(data)
    agent.open(login_url)

    # Agents select the username/password from the page.
    agent.select_form(predicate = lambda f: 'id' in f.attrs and f.attrs['id'] == 'login-form')
    agent['username'] = username
    agent['password'] = password

    # Working with browser information.
    agent.addheaders = [('User-agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/535.2 (KHTML, like Gecko) Chrome/15.0.874.121 Safari/535.2'), ]

    # Submit the login information.
    res = agent.submit()
    if res.get_data().find("Invalid") >= 0:
        quit("Login failed! Check your credentials.")
    elif res.get_data().find("SUCCESS") >= 0:
        print 'Login successful! Proceeding...'
    else:
        quit('Script may need to be updated.')

    # Now we need a very specific URL from the respose.
    response_url = re.search("response_url\s*=\s*'(.*)';", res.get_data()).groups()[0]
    agent.open(response_url)

def file_exists_in_folder(filename, folder):
    "Check if the file exists in folder of any subfolder"
    for _, _, files in os.walk(folder):
        if filename in files:
            return True
    return False

# Can be increased from 100 if needed.
def activities(agent, outdir, increment = 100):
    global ACTIVITIES
    currentIndex = 0
    initUrl = ACTIVITIES % (currentIndex, increment) 
    try:
        response = agent.open(initUrl)
    except:
        print('Wrong credentials for user {}. Skipping.'.format(username))
        return
    search = json.loads(response.get_data())
    totalActivities = int(search['results']['totalFound'])
    while True:
        for item in search['results']['activities']:
            # Read this list of activities and save the files.
            activityId = item['activity']['activityId']
            
            if filetype == 'GPX':
                url = GPX % activityId
                file_name = '{}_{}.gpx'.format(username, activityId)
            if filetype == 'TCX':
                url = TCX % activityId
                file_name = '{}_{}.tcx'.format(username, activityId)
            if filetype == 'CSV':
                url = CSV % activityId
                file_name = '{}_{}.csv'.format(username, activityId)
            if filetype == 'KML':
                url = KML % activityId
                file_name = '{}_{}.kml'.format(username, activityId)

            if file_exists_in_folder(file_name, output):
                print('{} already exists in {}. Skipping.'.format(file_name, output))
                continue
            print('{} is downloading...'.format(file_name))
            datafile = agent.open(url).get_data()
            file_path = os.path.join(outdir, file_name)
            f = open(file_path, "w")
            f.write(datafile)
            f.close()
            shutil.copy(file_path, os.path.join(os.path.dirname(os.path.dirname(file_path)), file_name))

        if (currentIndex + increment) > totalActivities:
            break

        # We still have at least 1 activity.
        currentIndex += increment
        url = ACTIVITIES % (currentIndex, increment)
        response = agent.open(url)
        search = json.loads(response.get_data())

def download_files_for_user(username, password, output):
    # Create the agent and log in.
    agent = me.Browser()
    login(agent, username, password)

    user_output = os.path.join(output, username)
    download_folder = os.path.join(user_output, 'Historical')

    # Need if directory isnt specified! Without specification, 
    if not os.path.exists(download_folder):
        os.makedirs(download_folder)

    # Scrape all the activities. GET THEM!
    activities(agent, download_folder)

folder_execute = os.path.dirname(sys.executable)
if folder_execute.endswith('/Contents/MacOS'):
    os.chdir(os.path.dirname(os.path.dirname(os.path.dirname(folder_execute))))

# Commandline arguments.
parser = argparse.ArgumentParser(description = 'Garmin File Downloader.',
    prog = '-u <user> -f File type to download from Garmin Connect. -o <output dir>')
parser.add_argument('-u', '--user', required = False,
    help = 'Garmin username.')
parser.add_argument('-o', '--output', required = False,
    help = 'Output directory.', default=os.path.join(os.getcwd(), 'Results/'))
parser.add_argument('-f', '--filetype', required = True,
    help = 'File type to download. CSV, KML, GPX, TCX, or ALL', default='TCX')

# Parsing argument from comamnd line. User and output.
args = vars(parser.parse_args())
output = args['output']
filetype = args['filetype']

if args['user'] is not None:
    password = getpass('Garmin account password:')
    username = args['user']
    download_files_for_user(username, password, output)



