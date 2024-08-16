<?php

include("DBConnector.php");

if ($_SERVER["REQUEST_METHOD"] == "POST"){

    $data = json_decode(file_get_contents("php://input"), true);

    if (isset($data)){

        $currUser = strtolower($data[1]);
        
        if (empty($currUser) || !isset($currUser) || $currUser == "" || strlen($currUser) == 0){

            echo "0";
            return;
        }

        if ($data[2] == "0"){//Search Users

            if (empty($data[0])){//We might have empty search data in the search bar
                echo "no result";
                return;
            }

            $query_search = "SELECT username, image FROM users WHERE username LIKE '%$data[0]%' AND NOT username = '$currUser'";

            $result = mysqli_query($conn, $query_search);

            if (!isset($result)){

                echo "no result";
                return;
            }

            $tableResult = [];
            while($row = mysqli_fetch_assoc($result)){

                if (isset($row) && !empty($row)){

                    $tableName = "chats_" . $currUser;
                    $receiverName = $row["username"];
                    $query_searchHistory = "SELECT * FROM $tableName WHERE (user1 = '$receiverName' || user2 = '$receiverName') AND visible = 1";

                    $result2 = mysqli_query($conn, $query_searchHistory);
                    

                    if (mysqli_num_rows($result2) > 0){
                        continue;
                    }

                    array_push($tableResult, $row);
                }
            }

            if (empty($tableResult) || !isset($tableResult)){

                echo "no result";
            }else{

                echo json_encode($tableResult);
            }

        }else if ($data[2] == "1"){//Make conversations visible/invisible or create new ones

            $tableName = "chats_{$currUser}";

            //We must save the given chat in the recent activity
            $query_chatSearch = "SELECT * FROM $tableName WHERE user1 = '$data[0]' || user2 = '$data[0]'";
            $result_chatSearch = mysqli_query($conn, $query_chatSearch);


            if (mysqli_num_rows($result_chatSearch) > 0){//Conversation already exists, just make it visible

                //This chat is not new,we're going to make it visible/hidden
                $query_makeChatVisible = "UPDATE $tableName SET visible = $data[3] WHERE user1 = '$data[0]' || user2 = '$data[0]'";
                mysqli_query($conn, $query_makeChatVisible);

                echo "success";

            }else{//Conversation doesn't exist, we must create a new one

                //decide the table name
                
                $chatTableName = "";
                $firstName = "";
                $secondName = "";
                $receiverTableName = "chats_";//The chats table of the receiver user, depending on whose name comes first this will be different
                
                $order = strnatcmp($currUser,$data[0]);

                if ($order == -1){

                    //current's user comes first
                    $chatTableName = "chat_" . strtolower($currUser) . "_" . strtolower($data[0]);
                    $firstName = $currUser;
                    $secondName = $data[0];
                    $receiverTableName .= $secondName; 

                }else{

                    //current's user name comes second
                    $chatTableName = "chat_" . $data[0] . "_" . $currUser;
                    $firstName = $data[0];
                    $secondName = $currUser;
                    $receiverTableName .= $firstName; 
                }

               
                try{
                    //This chat is new and we must create a new table for it, add the chat table name into the users' chats table 
                    $query_createChatTable = "CREATE TABLE `whatsdowndb`.`$chatTableName` (`id` INT NOT NULL AUTO_INCREMENT , `username` VARCHAR(255) NOT NULL , `message` TEXT NOT NULL , `type` VARCHAR(255) NOT NULL , `date_sent` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP , `spoiler` BOOLEAN NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;";
                    mysqli_query($conn, $query_createChatTable);

                    //Now we insert into the users' chats tables that they have a common chat
                    $query_updateChatsTable1 = "INSERT INTO `$tableName` (`chat_name`, `user1`, `user2`, `visible`) VALUES ('$chatTableName', '$firstName', '$secondName', '1')";
                    mysqli_query($conn, $query_updateChatsTable1);

                    $query_updateChatsTable2 = "INSERT INTO `$receiverTableName` (`chat_name`, `user1`, `user2`, `visible`) VALUES ('$chatTableName', '$firstName', '$secondName', '0')";
                    mysqli_query($conn, $query_updateChatsTable2);

                    echo "success";

                }catch(mysqli_sql_exception $er){

                    echo "SQL FAILED: " . $er;
                    return;
                }
            }


        }else if ($data[2] == "2"){//Retrieve all visible conversations

            $query_retrieveVisibleChats = "";
            $tableName = "chats_" . $currUser;

            if (!isset($currUser) || empty($currUser) || $currUser == ""){//We might receive requests from the page before it completely loads

                echo json_encode(["empty"]);
                return;
            }
            

            if (!empty($data[0] && isset($data[0]))){//It means that we're also providing a specific input to search for

                $query_retrieveVisibleChats = "SELECT * FROM $tableName WHERE (visible = 1)  AND  (user1 LIKE '%$data[0]%' OR user2 LIKE '%$data[0]%')";
                
            }else{//Or we have to look for all visible chats
                $query_retrieveVisibleChats = "SELECT * FROM $tableName WHERE visible = 1";
            }

            //query to select all visible chats from current user's chats table
             
            $result = mysqli_query($conn, $query_retrieveVisibleChats);

            $tableData = [];

            while ($row = mysqli_fetch_assoc($result)){

                if (isset($row) && !empty($row)){

                    $receiverName = "";

                    if ($currUser != $row["user1"]){
                        $receiverName = $row["user1"];
                    
                    }else{

                        $receiverName = $row["user2"];
                    }

                    $query_searchReceiverImage = "SELECT image FROM users WHERE username = '$receiverName'";

                    $results_imageSearch = mysqli_query($conn, $query_searchReceiverImage);
                    $imgPath = "";

                    if (mysqli_num_rows($results_imageSearch) > 0){

                        $imgPath = mysqli_fetch_assoc($results_imageSearch)["image"];
                    }

                    $row2 = ["chat_name" => $row["chat_name"], "username" => $receiverName,"image" => $imgPath];
 
                    array_push($tableData, $row2);
                }
            }

            //Check if it's empty, then retrieve 'empty'

            if (!isset($tableData) || count($tableData) == 0 || empty($tableData)){

                echo json_encode("empty");
                return;
            }

            echo json_encode($tableData);

        }
        else{

            echo "INVALID REQUEST";
        }

    }else{

        echo "no result";
        return;
    }
}
?>