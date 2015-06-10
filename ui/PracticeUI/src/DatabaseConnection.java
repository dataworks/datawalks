

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;


public class DatabaseConnection {


    /** Database connection string. */
    private static final String DB_URL = "jdbc:postgresql://dw-intern-db-micro.crr707brjv0s.us-east-1.rds.amazonaws.com:5432/geodata";

    /** Database user name. */
    private static final String DB_USER = "geodata";

    /** Database password. */
    private static final String DB_PASS = "geodata##!";

    /**
     * Static block; loads the JDBC driver.
     */
    static {
        try {
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException exc) {
            exc.printStackTrace();
        }
    }

    /**
     * Opens a new connection to the database.
     */
    public static Connection open() throws SQLException {
        return DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
    }

}