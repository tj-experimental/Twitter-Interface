/**
 * Created by tonye on 2017-03-28.
 */

$(document).ready(function(){
    var $textArea =  $("#tweet-textarea");
    var $alertSuccess = $('.alert-success');
    var $alertWarning = $('.alert-warning');
    var alerts = [$alertSuccess, $alertWarning];
    // var user,pass;
    // $("#submit").click(function(){
    //     user=$("#user").val();
    //     pass=$("#password").val();
    //     $.post("http://localhost:3000/login",{user: user,password: pass}, function(data){
    //         if(data==='done')
    //         {
    //             alert("login success");
    //         }
    //     });
    // });


    alerts.forEach(function ($element) {
        if ($element.length !== 0 && $element.css('display') !== 'None'){
            alert($element.text());
        }
    });

    $textArea.on('keydown', function () {
        $textArea.css('border', 'None');
    });

    $('.post-form').submit(function (event) {

        var tweet = $textArea.val();

        if(tweet === undefined || tweet === "") {
            $textArea.css('border', '2px solid red');
            event.preventDefault();
        }else{
            $textArea.css('border', 'None');
        }
    });

    if ("/sign-in" === window.location.pathname){
        $('.sign-out').hide();
    }

});


