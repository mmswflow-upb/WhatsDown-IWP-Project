<?php

    include("DBConnector.php");

    if ($_SERVER["REQUEST_METHOD"] == "POST"){

        $data = json_decode(file_get_contents("php://input"), true);

        if (isset($data) && !empty($data)){

            //Data should contain: current username, chat table name, last Date
            //The returned data should be: username of  the receiver, the path of the image of the receiving user, receiver bio, the date & time of the last message 
            //and a table of messages from the conversation

            $returnData = ["","","","",[]];

            $query_getMessages = "";

            if (!isset($data[2]) || empty($data[2]) || trim($data[2]) == ""){//We haven't specified a date, so we must retrieve every message.

                $query_getMessages = "SELECT * FROM $data[1] ORDER BY date_sent ASC";

            }else{//we have specified a date, so we have to retrieve all messages after that date
                
                $query_getMessages = "SELECT * FROM $data[1] WHERE date_sent > '$data[2]' ORDER BY date_sent ASC";
            }

            
            $result = mysqli_query($conn, $query_getMessages);

            
                while($row = mysqli_fetch_assoc($result)){//Insert all rows into the returning data table

                    array_push($returnData[4], $row);
                    $returnData[3] = $row["date_sent"];
                }

                //Now we have to get the username & pfp image of the receiver.

                $chatTableName = "chats_".$data[0];

                $query_getRowFromChatsTable = "SELECT * FROM $chatTableName WHERE chat_name = '$data[1]'";

                $result2 = mysqli_query($conn, $query_getRowFromChatsTable);

                if (mysqli_num_rows($result2) > 0){//We found the receiver's  username in our chats table

                    $row2 = mysqli_fetch_assoc($result2);

                    //We must find out which is the receiver's username from the returned row
                    if ($row2["user1"] == $data[0]){

                        $returnData[0] = $row2["user2"];

                    }else{
                        
                        $returnData[0] = $row2["user1"];
                    }

                    $query_getReceiverImage = "SELECT image,bio FROM users WHERE username = '$returnData[0]'";
                    $result3 = mysqli_query($conn, $query_getReceiverImage);

                    $row = mysqli_fetch_assoc($result3);
                    $returnData[1] = $row["image"];
                    $returnData[2] = $row["bio"];

                    $returnDataAssoc = ["receiverName"=> $returnData[0], "receiverImage"=>$returnData[1], "bio"=>$returnData[2], "lastDate" => $returnData[3],
                    "messagesTable" => $returnData[4]];

                    echo json_encode($returnDataAssoc);


                }else{//Somehow we couldn't find row in the chats table of the current user containing the name of current conversation
                    echo json_encode("empty");
                }

            

        }else{//The provided data is not valid

            echo json_encode("empty");
            return;
        }
    }

?>