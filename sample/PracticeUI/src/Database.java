import java.sql.*;
import java.util.*;


public class Database {
	private static ArrayList<String> time = new ArrayList<String>();
	
	public static ArrayList<String> timeFormating() throws SQLException {
        PreparedStatement st;
        Connection db;
        db = DatabaseConnection.open();
        ResultSet rs;

        String sql = "SELECT time FROM dan_drive";
        st = db.prepareStatement(sql);
        rs = st.executeQuery();

        ArrayList<String>temp = new ArrayList<String>();
        
        while(rs.next()){
            String phrase = rs.getString(1);
            
            String delims = "[T]";
            String data[] = phrase.split(delims);
            temp.add(data[0]);
            time.add(data[1]);
        }
        

        st.close();
        rs.close();
        db.close();
        return temp;
    }
	
	public static ArrayList<String[]> table() throws SQLException {
        PreparedStatement st;
        Connection db;
        db = DatabaseConnection.open();
        ResultSet rs;

        String sql = "SELECT * FROM dan_drive";
        st = db.prepareStatement(sql);
        rs = st.executeQuery();

        ArrayList<String[]>temp = new ArrayList<String[]>();
        
        while(rs.next()){
        	String[] data = {rs.getString(1),rs.getString(2),rs.getString(3),rs.getString(4) };
            temp.add( data );
        }
        

        st.close();
        rs.close();
        db.close();
        return temp;
    }
	
	
	public static void format() throws SQLException{
		
		ArrayList<String[]> temp = Database.table();
		
		for(int i = 0; i < temp.size(); i++){
			for( int x = 0; x < temp.get(i).length; x++)
			{
				System.out.print(temp.get(i)[x] + ", ");
			}
			System.out.println();
			
		}
	}
	
	
	
	public static void main(String args[] ) throws SQLException {
		
		Database.format();
	
	}

}