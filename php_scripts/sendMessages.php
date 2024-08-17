<?php 

date_default_timezone_set("Europe/Bucharest");

    include("DBConnector.php");

    if ($_SERVER["REQUEST_METHOD"] == "POST"){
     
        $data = json_decode(file_get_contents("php://input"), true);
        //Data should contain: chat table name,sender username, message, type,spoiler tag,receiver username 

        if (isset($data)){

            if (count($data) == 6){//Check if we have the necessary data

                $dt = date("Y-m-d h:i:sa");

                $data[2] = addslashes($data[2]);

                $query_saveMessageInChat = "INSERT INTO `$data[0]` (`id`, `username`, `message`, `type`, `date_sent`, `spoiler`) VALUES (NULL, '$data[1]', '$data[2]','$data[3]', '$dt', '$data[4]');";
                    
                //If conversation was not visible to receiver user, we make it visible after sending any message.
                $receiverChatsTableName = "chats_".$data[5];
                $query_displayChatInReceiverHistory = "UPDATE `$receiverChatsTableName` SET visible = 1 WHERE chat_name = '$data[0]'";
                try{

                    mysqli_query($conn, $query_saveMessageInChat);
                    mysqli_query($conn, $query_displayChatInReceiverHistory);
                    mysqli_commit($conn);
                    
                    echo json_encode("success");

                }catch(mysqli_sql_exception $er){

                        echo json_encode("ERROR WHEN TRYING TO SEND MESSAGE: ") . $er;
                }

            }else{// we haven't provided enough information

                echo json_encode("Not Enough Data");
            }

        }else{//The data array is empty

            echo "INVALID REQUEST";
        }

    }

?>