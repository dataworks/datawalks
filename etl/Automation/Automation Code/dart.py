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

def file_exists_in_folder(filename, archive):
    "Check if the file exists in folder of any subfolder"
    for _, _, files in os.walk(archive):
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

                if file_exists_in_folder(file_name, archive):
                    print('{} already exists in {}. Skipping.'.format(file_name, archive))
                    continue
                print('{} is downloading...'.format(file_name))
                datafile = agent.open(url).get_data()
                file_path = os.path.join(output, file_name)
                f = open(file_path, "w")
                f.write(datafile)
                f.close()
             

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

    # Scrape all the activities. GET THEM!
    activities(agent, output)

folder_execute = os.path.dirname(sys.executable)
if folder_execute.endswith('/Contents/MacOS'):
    os.chdir(os.path.dirname(os.path.dirname(os.path.dirname(folder_execute))))

# Commandline arguments.
parser = argparse.ArgumentParser(description = 'Garmin File Downloader.',
    prog = '-u <user> -f File type to download from Garmin Connect. -o <output dir>')
parser.add_argument('-u', '--user', required = False,
    help = 'Garmin username.')
parser.add_argument('-o', '--output', required = True,
    help = 'Output directory filepath.', default=os.path.join(os.getcwd(), 'Results/'))
parser.add_argument('-f', '--filetype', required = True,
    help = 'File type to download. CSV, KML, GPX, TCX, or ALL', default='TCX')
parser.add_argument('-l', '--login', required=True,
    help = 'Comma separated file with no spaces (Username,Password).',
    default = os.path.join(os.getcwd(), 'password.csv'))
parser.add_argument('-a', '--archive', required=True,
    help = 'Archive to check if its been downloaded.',
    default = "/dataworks/$USER/archive")


# Parsing argument from comamnd line. User and output.
args = vars(parser.parse_args())
output = args['output']
filetype = args['filetype']
archive = args['archive']

if args['user'] is not None:
    password = getpass('Garmin account password:')
    username = args['user']
    download_files_for_user(username, password, output)

# CSV Password File Input 
if args['login'] is not None:
    csv_file_path = args['login']
    if not os.path.exists(csv_file_path):
        print("CSV file doesn't exist.")
        sys.exit()
    else:
        with open(csv_file_path, 'r') as c:
            for line in c:
                try:
                    if ',' in line:
                        username, password = (line.strip().split(','))
                        print 'Downloading files for user {}'.format(username)
                        download_files_for_user(username, password, output)
                except IndexError:
                    raise Exception('Wrong line in CSV file. Please check the line {}'.format(line))

