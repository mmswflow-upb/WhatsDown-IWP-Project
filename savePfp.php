<?php

    include("DBConnector.php");

    if ($_SERVER["REQUEST_METHOD"] == "POST"){//Check if we're calling the php script with correct method

        if (isset($_FILES["files"]["name"])){//Check if there's any actual file

            //Name of the file
            $fileToBeSaved = $_FILES["files"]["name"];

            //Where we will save the files
            $uploadLocation = "images_sent/";
            
            //Complete future path of current file
            $path = $uploadLocation.$fileToBeSaved;

            $currUser = json_decode($_COOKIE["loggedIn"], true)["username"];
            $query_getData = "SELECT * FROM users WHERE username = '$currUser'";
            $result = mysqli_query($conn, $query_getData);
            $userData = mysqli_fetch_assoc($result);


            if (trim($userData["image"], " ") != "images/pfpDefault.jpg"){
                    
                try{
                    unlink(trim($userData["image"]));

                }catch(mysqli_sql_exception $e){

                    
                }
            }
            if (move_uploaded_file($_FILES["files"]["tmp_name"], $path)){
                
                $t = $dt = date("Y_m_d_h_i_sa");
                $newName = "images_sent/pfp_". $userData["username"].trim($t);

                rename($path, $newName);
                echo $newName;

            }else{

                echo "Failed to upload file";
            }

        }else{
            echo "There is no file to be uploaded";
        }

    }else{
        echo "Invalid Request Method";
    }

?>