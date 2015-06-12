import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConnection {
    /** Database connection string. */
    private static final String DB_URL = "jdbc:postgresql://host:port/geodata";

    /** Database user name. */
    private static final String DB_USER = "user";

    /** Database password. */
    private static final String DB_PASS = "password";

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
