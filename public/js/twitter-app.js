/**
 * Created by tonye on 2017-03-28.
 */

/* global $*/


$(document).ready(function(){
    var $textArea =  $('#tweet-textarea');

    $textArea.on('keydown', function () {
        $textArea.css('border', 'None');
    });

    $('.post-form').submit(function (event) {

        var tweet = $textArea.val();

        if(tweet === undefined || tweet === '') {
            $textArea.css('border', '2px solid red');
            event.preventDefault();
        }else{
            $textArea.css('border', 'None');
        }
    });

    if ('/sign-in' === window.location.pathname){
        $('.sign-out').hide();
    }

    $('.alert').on('click', function () {
        $(this).hide('fast');
        $.get('/clear-flash');
    });

});


