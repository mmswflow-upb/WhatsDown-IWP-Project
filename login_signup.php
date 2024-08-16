<?php

include("DBConnector.php");

$cookieLife = 86400 * 300;

if ($_SERVER["REQUEST_METHOD"] == "POST"){

    $data = json_decode(file_get_contents("php://input"), true);
 
    if (isset($data)){  

        if (count($data) >= 2 && count($data) <= 3){

            $username = strtolower($data[0]);
            $password = $data[1];
   
            if (count($data) == 3){//Sign up request

                if (empty($username)){
        
                    echo "INVALID USERNAME";//Invalid Username.
                    return;
                }else if (strlen($username) < 5){
    
                    echo "USERNAME TOO SHORT";
                    return;
                }
            
                if (empty($password)){
            
                    echo "INVALID PASSWORD" ;//Invalid password
                    return;
                }else if (strlen($password) < 3){
    
                    echo "PASSWORD TOO SHORT";
                    return;
                }
                $password_conf = $data[2];
                
                if ($password != $password_conf){
        
                    echo "PASSWORDS NOT MATCHING";//Passwords are not matching.
                    return; 
                }
                $hash_pass = password_hash($password,PASSWORD_DEFAULT);
                
                $query = "SELECT username FROM users WHERE username = '$username'";

                $result = mysqli_query($conn, $query);
                
                if (mysqli_num_rows($result) > 0){//There exists a user with that name already

                    echo "USERNAME ALREADY TAKEN";
                    return;
                }else{

                    //Add user entry into the users table
                    $query_save = "INSERT INTO users(username, password, image,bio, theme, back_image,back_color) VALUES('$username', '$hash_pass', 'images/pfpDefault.jpg','Hello There! I am using Whatsdown!', 'light' , 'images/dam.jpg', 'default')";

                    mysqli_query($conn, $query_save);
                    mysqli_commit($conn);

                    //Create a chats_table for the newly created user
                    $tableName1 = "chats_" . strtolower($username);
                    $query_chatsTable = "CREATE TABLE `whatsdowndb`.`$tableName1` (`chat_name` VARCHAR(255) NOT NULL , `user1` VARCHAR(255) NOT NULL , `user2` VARCHAR(255) NOT NULL , `visible` BOOLEAN NOT NULL , UNIQUE `UNIQUE` (`chat_name`)) ENGINE = InnoDB;";

                    mysqli_query($conn, $query_chatsTable);
                    mysqli_commit($conn);

                    echo "ACCOUNT CREATED SUCCESSFULLY";
                    return;
                }
        
            }else if (count($data) == 2){//Log in request
        
                $query_check = "SELECT username FROM users WHERE username = '$username'";
                $search1 = mysqli_query($conn, $query_check);

                if (mysqli_num_rows($search1) == 1){


                    $query_check2 = "SELECT password FROM users WHERE username = '$username'";
                    $search2 = mysqli_query($conn, $query_check2);

                    $row = mysqli_fetch_assoc($search2);

                    if (password_verify($password, $row["password"])){

                        $query_data = "SELECT * FROM users WHERE username = '$username'";
                        $search3 = mysqli_query($conn ,$query_data);
                        $row2 = mysqli_fetch_assoc($search3);
                        setcookie("loggedIn", json_encode($row2), time() + $cookieLife);
                        echo "SUCCESS";
                        return;
                    }else{

                        echo "INCORRECT PASSWORD";
                        return;
                    }

                }else{

                    echo "USERNAME NOT FOUND";
                    return;
                }
            }
        }
    }else{

        echo "NO DATA PROVIDED.";
    }
}else{

    if (isset($_COOKIE["loggedIn"])){

        echo "denied";//Access Denied, they were logged in before

    }else{

        echo "granted";//Access Granted, they weren't logged in before
    }
}
?>