<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = htmlspecialchars($_POST['name']);
    $email = htmlspecialchars($_POST['email']);
    $message = htmlspecialchars($_POST['message']);

    $to = "nqwabena7@gmail.com"; // Replace with your email
    $subject = "New Contact Message from $name";
    $body = "Name: $name\nEmail: $email\n\nMessage:\n$message";
    $headers = "From: $email\r\nReply-To: $email";

    if (mail($to, $subject, $body, $headers)) {
        echo "<h2 style='text-align:center;'>Thank you, $name! Your message has been sent.</h2>";
    } else {
        echo "<h2 style='text-align:center;color:red;'>Sorry, something went wrong. Please try again later.</h2>";
    }
} else {
    echo "<h2 style='text-align:center;color:red;'>Invalid Request</h2>";
}
?>
