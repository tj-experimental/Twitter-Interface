/**
 * Created by tonye on 2017-03-28.
 */

$(document).ready(function(){
    var $textArea =  $("#tweet-textarea");
    var $alertInfo = $('.alert-info');
    var $alertError = $('.alert-error');
    var alerts = [$alertInfo, $alertError];
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

    // Need to fix the flash message always showing up on refresh
    alerts.forEach(function ($element) {
        if ($element.children('p')[0] !== undefined && $element.children('p')[0].textContent !== ''){
            alert($element.children('p')[0].textContent );
            $element.children('p')[0].innerHTML = '';
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


