<?php

    if ($_SERVER["REQUEST_METHOD"] == "POST"){//Check if we're calling the php script with correct method

        if (isset($_FILES["files"]["name"])){//Check if there's any actual file

            //Name of the file
            $fileToBeSaved = $_FILES["files"]["name"];

            //Where we will save the files
            $uploadLocation = "images_sent/";
            
            //Complete future path of current file
            $path = $uploadLocation.$fileToBeSaved;

            $response = 0;

            if (move_uploaded_file($_FILES["files"]["tmp_name"], $path)){
                
                $gb = glob("images_sent/*");

                if ($gb != false){

                    $countOfFiles = count($gb);
                    $newName = $uploadLocation."imageSent_".$countOfFiles;
                    rename($path, $newName);
                    echo $newName;
                }

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