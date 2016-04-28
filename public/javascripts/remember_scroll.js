
$(window).scroll(function() {
	sessionStorage.scrollTop = $(this).scrollTop();
    });

$(document).ready(function() {
   	if (sessionStorage.scrollTop != "undefined") {
	    sessionStorage.lastScrollTop = sessionStorage.scrollTop;
	    setTimeout(function(){
			  $(window).scrollTop(sessionStorage.lastScrollTop);
		          sessionStorage.scrollTop = sessionStorage.lastScrollTop;
		        } , 0);
	}
    });
