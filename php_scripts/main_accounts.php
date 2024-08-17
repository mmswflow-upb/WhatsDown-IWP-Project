<?php

include("DBConnector.php");

if ($_SERVER["REQUEST_METHOD"] == "GET"){
    if (isset($_COOKIE["loggedIn"])){

        $currUser = json_decode($_COOKIE["loggedIn"], true)["username"];
        $query_searchData = "SELECT * FROM users WHERE username = '$currUser'";
        $result = mysqli_query($conn, $query_searchData);
        $row = mysqli_fetch_assoc($result);
        $userData = $row;
        $_COOKIE["loggedIn"] = json_encode($row);
        echo json_encode($userData);//Access Granted, they were logged in before
    
    }else{
    
        echo json_encode("denied");//Access Denied, they weren't logged in before
    }
}else{// Log out

    setcookie("loggedIn", "", 0.1);

}

?>
