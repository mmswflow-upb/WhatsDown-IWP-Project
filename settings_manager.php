<?php

    include("DBConnector.php");

    $data = json_decode(file_get_contents("php://input"), true);
   
    if ($data[0] == "set"){//We are setting new things

        //Data will contain:operation,  currUser, setting that's changing, value of setting

        if ($data[2] == "bio"){

            $data[3] = addslashes($data[3]);
        }

        $query_changeBackColor = "UPDATE users SET $data[2] = '$data[3]' WHERE username = '$data[1]'";
        mysqli_query($conn, $query_changeBackColor);
        echo "success";
    }
    else{//We are retrieving info

        $query_getSettings = "SELECT image,bio,theme,back_image,back_color FROM users WHERE username = '$data[1]'";
        $result = mysqli_query($conn, $query_getSettings);
        $row = mysqli_fetch_assoc($result);

        echo json_encode($row); 
    }

?>