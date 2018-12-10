<?php

    // $request_method = $_SERVER["REQUEST_METHOD"];

	/*
	foreach ( $_SERVER as $key=>$value ) {
	   print "\$_SERVER[\"$key\"] == $value<br/>";
	}

		echo $_SERVER["REDIRECT_URL"];
		echo nl2br ("\n");
		echo $_SERVER["REDIRECT_QUERY_STRING"];
		echo nl2br ("\n");
	*/

	if ($_SERVER["REQUEST_METHOD"] === "GET") {

         header("Location: /");
         exit();
	}

    /*
    function __autoload ( $class_name ) {

		$path = str_replace( "_", "/", $class_name );

		if ( file_exists( $path.".php" )) {

			include_once( $path.".php" );

		} else {

			header( 'HTTP/1.0 404 Not Found' );
			echo 'Cтраницы не существует';
			exit();

		}
	}
	*/

	class myPDO extends PDO {

		final private function __clone() {}
	}

	class myDB {

		final private function __construct() {}
		final private function __clone() {}
		final private function __sleep() {}
		final private function __wakeup() {}

		private static $_instance = null;

		const DB_HOST = 'localhost';
		const DB_USER = 'ant-sv';
		const DB_PASS = '******';
		const DB_NAME = 'ant-sv_blog';
		const DB_TYPE = 'mysql';

		public static function connect() {

			if ( self::$_instance === null ) {

				try {

					self::$_instance = new myPDO (

						self::DB_TYPE.':host='.self::DB_HOST.';dbname='.self::DB_NAME,
						self::DB_USER,
						self::DB_PASS,
						array (

							PDO::ATTR_PERSISTENT => true,
							PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8'
						)
					);

					self::$_instance->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );

				}
				catch (PDOException $e) {

					echo 'ошибка подключения к базе данных';
					// file_put_contents( 'logs/PDOErrors.txt', $e->getMessage(), FILE_APPEND );
				}
			}

			return self::$_instance;
		}
	}

    // include("../connection.php");

	switch ($_SERVER["PATH_INFO"]) {

        case "/blog":
            GetBlog(); break;

		case "/post":
		    GetPost(); break;

	    case "/update":
		    SetPost(); break;

		case "/edit":
		    GetPost(); break;

	    default:
	        $result = "error 404\n";
	        foreach ( $_SERVER as $key=>$value ) $result .= "\$_SERVER[\"$key\"] = $value\n";
            echo $result;
	}

	function GetBlog() {

		$dbo = myDB::connect();
		$query = 'SELECT * FROM blog WHERE deleted = 0 ORDER BY created DESC';

		$data = '';

		# foreach ( $_POST as $key=>$value ) $data .= "\$_POST[\"$key\"] = $value\n";

		try {

            $stmt = $dbo->query($query);
        	$data .= json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            echo $data;

        } catch(PDOException $e) {

            echo $e->getMessage();
        }

		
		exit();
	}

	function GetPost() {

        $dbo = myDB::connect();

        $query = $_POST['data'] == 'last' ?
            'SELECT * FROM blog WHERE deleted = 0 ORDER BY created DESC LIMIT 1' :
            'SELECT * FROM blog WHERE id = ? AND deleted = 0';

		// if ($row = $stmt->fetch(PDO::FETCH_NUM)) {
            // foreach ($row as $key => $value) echo $key . ": " . $value . "<br>";
		// }

		$data = '';

		try {

            $stmt = $dbo->prepare($query);
		    $stmt->execute(array($_POST['data']));
        	$data .= json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            echo $data;

        } catch(PDOException $e) {

            echo $e->getMessage();
        }

        exit();

		// echo 'ничего не обнаружено ' . __CLASS__;
	}

	function SetPost() {

		$dbo = myDB::connect();

		$data = '';

		foreach ( $_POST as $key=>$value ) $data .= "\$_POST[\"$key\"] = $value\n";
		foreach ( $_FILES as $key=>$value ) $data .= "\$_FILES[\"$key\"] = $value\n";
		foreach ( $_FILES["image"] as $key=>$value ) $data .= "\$_FILES[\"image\"][\"$key\"] = $value\n";

		// $_FILES['file'];

		echo $data;
		exit();

		/*

		$title = "";
		$content = "";

        $sql = "INSERT INTO blog (title, content, created, sm_image, image)
                VALUES
                    (?, ?, NOW(), 'test', 'test')";

               # WHERE id=:id";
        $smtp = $dbo->prepare($sql);
        $smtp->execute(array($title, $content));

        // --------------------------------------------

		$query = "CREATE table blog(
			id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
			title VARCHAR(255) NOT NULL,
			content TEXT NOT NULL,
			created DATETIME NOT NULL,
			updated DATETIME DEFAULT CURRENT_TIMESTAMP,
			sm_image VARCHAR(255) NOT NULL,
			image VARCHAR(255) NOT NULL,
			deleted BOOLEAN NOT NULL DEFAULT 0)";

        try {

        	$dbo->exec($query);
        	echo "Table blog - Created!<br><br>";

        } catch(PDOException $e) {

        	echo "Table blog not successfully created! <br><br>";
            echo $e->getMessage();
        }
*/    
	}

?>