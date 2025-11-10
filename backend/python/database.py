import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

load_dotenv()

class DatabaseConnection:
    def __init__(self):
        self.host = os.getenv('DB_HOST', 'localhost')
        self.database = os.getenv('DB_NAME', 'findmyprofessor')
        self.user = os.getenv('DB_USER', 'root')
        self.password = os.getenv('DB_PASSWORD', '')
        self.connection = None
    
    def connect(self):
        """Create database connection"""
        try:
            self.connection = mysql.connector.connect(
                host=self.host,
                database=self.database,
                user=self.user,
                password=self.password
            )
            
            if self.connection.is_connected():
                return self.connection
        except Error as e:
            print(f"Error connecting to MySQL: {e}")
            return None
    
    def disconnect(self):
        """Close database connection"""
        if self.connection and self.connection.is_connected():
            self.connection.close()
    
    def fetch_all_data(self):
        """Fetch all professor, subject, and schedule data with attachments"""
        try:
            connection = self.connect()
            if not connection:
                return []
            
            cursor = connection.cursor(dictionary=True)
            
            query = """
                SELECT 
                    p.id as professor_id,
                    p.name as professor_name,
                    p.department,
                    p.contact,
                    p.email,
                    p.office_location,
                    p.bio,
                    p.image_url,
                    s.id as subject_id,
                    s.subject_code,
                    s.subject_name,
                    s.description as subject_description,
                    s.units,
                    sch.id as schedule_id,
                    sch.classroom,
                    sch.day,
                    sch.time_start,
                    sch.time_end,
                    sch.semester,
                    sch.academic_year,
                    sch.section,
                    sch.description as schedule_description
                FROM professors p
                LEFT JOIN subjects s ON p.id = s.professor_id
                LEFT JOIN schedules sch ON p.id = sch.professor_id AND s.id = sch.subject_id
                ORDER BY p.name, s.subject_code, sch.day, sch.time_start
            """
            
            cursor.execute(query)
            results = cursor.fetchall()
            
            cursor.close()
            self.disconnect()
            
            return results
        
        except Error as e:
            print(f"Error fetching data: {e}")
            return []
    
    def fetch_attachments(self, professor_id=None, schedule_id=None):
        """Fetch attachments for a professor or schedule"""
        try:
            connection = self.connect()
            if not connection:
                return []
            
            cursor = connection.cursor(dictionary=True)
            
            if professor_id:
                query = """
                    SELECT 
                        a.id,
                        a.file_name,
                        a.file_path,
                        a.file_type,
                        a.description,
                        a.schedule_id,
                        s.subject_name,
                        s.subject_code
                    FROM attachments a
                    LEFT JOIN schedules sch ON a.schedule_id = sch.id
                    LEFT JOIN subjects s ON sch.subject_id = s.id
                    WHERE a.professor_id = %s
                    ORDER BY a.created_at DESC
                """
                cursor.execute(query, (professor_id,))
            elif schedule_id:
                query = """
                    SELECT 
                        a.id,
                        a.file_name,
                        a.file_path,
                        a.file_type,
                        a.description
                    FROM attachments a
                    WHERE a.schedule_id = %s
                    ORDER BY a.created_at DESC
                """
                cursor.execute(query, (schedule_id,))
            else:
                return []
            
            results = cursor.fetchall()
            
            cursor.close()
            self.disconnect()
            
            return results
        
        except Error as e:
            print(f"Error fetching attachments: {e}")
            return []
    
    def search_professors(self, query):
        """Search professors by name, department, or subject"""
        try:
            connection = self.connect()
            if not connection:
                return []
            
            cursor = connection.cursor(dictionary=True)
            
            search_query = f"%{query}%"
            
            query_sql = """
                SELECT DISTINCT
                    p.id,
                    p.name,
                    p.department,
                    p.email,
                    p.office_location,
                    p.bio,
                    p.image_url
                FROM professors p
                LEFT JOIN subjects s ON p.id = s.professor_id
                WHERE p.name LIKE %s
                   OR p.department LIKE %s
                   OR s.subject_name LIKE %s
                   OR s.subject_code LIKE %s
                ORDER BY p.name
                LIMIT 10
            """
            
            cursor.execute(query_sql, (search_query, search_query, search_query, search_query))
            results = cursor.fetchall()
            
            cursor.close()
            self.disconnect()
            
            return results
        
        except Error as e:
            print(f"Error searching professors: {e}")
            return []
