
;var klowdjs = klowdjs || {};
   

klowdjs.breakpoints = {
    screenSizes: [0,240,320,480,560,672,768,864,960,1024,1200,1440]
    ,tshirts: ['base','xs','s','sm','m','mml','ml','mll','l','xl','xxl','xxxl']
    ,translateTshirtScreen : function(input,product) {
        if(product == "screen") {
            return klowdjs.breakpoints.screenSizes[$.inArray(input, klowdjs.breakpoints.tshirts)];
        } else if(product == "tshirt") {
            return klowdjs.breakpoints.tshirts[$.inArray(input, klowdjs.breakpoints.screenSizes)];
        }
    }
    ,getBreakpoint : function(product) {
        var width = $(window).width()
            ,sizes = klowdjs.breakpoints.screenSizes
            ,breakpoint = 0;
        while(sizes.length > 0) {
            var length = sizes.length
                ,high = sizes[length-1];
            if(width >= high) {
                breakpoint = high;
                break;
            } else {
                var half = Math.floor(length/2)
                    ,mid = sizes[half];
                if(width < mid) { sizes = sizes.slice(0,half); }
                else if(width > mid) { sizes = sizes.slice(half); }
                else {
                    breakpoint = mid;
                    break;
                }
            }
        }
        if(product == "tshirt") {
            breakpoint = klowdjs.breakpoints.translateTshirtScreen(breakpoint, "tshirt");
        }
        return breakpoint;
    }
};

klowdjs.doDrawers = function() {
    $('.js-drawer').each(function(){
            
        var jsDrawer = $(this);
        if(jsDrawer.find(".js-drawer-heading").length > 0 && jsDrawer.find(".js-drawer-content").length > 0) {
            jsDrawer.drawer({breakpoints:["all"]});
        }		
    });
};

klowdjs.doAccordions = function() {
  $('.js-accordion').each(function(){
      
      var jsAccordion = $(this);
      
  });
};

klowdjs.doCarousels = function() {
    $('.js-carousel-container-fade').each(function(){
       
        var jsCarousel = $(this);
        jsCarousel.removeClass("l-display-none");
        jsCarousel.find(".js-carousel:first").carouFredSel({
            width: "100%"
            ,height: 150
            ,items: {
                min: 1
                ,max: 3
            }
            ,scroll: {
                items: 2
                ,duration: 2000
                ,timeoutDuration: 1800
                ,fx: "crossfade"
            }
        }).children().each(function() {
            $(this).css('marginTop', ( 150 - $(this).outerHeight() ) / 2 );
	});
        
    });
    
};

;$(document).ready(function(){
    klowdjs.doDrawers();
    klowdjs.doAccordions();
});

;$(window).load(function(){
    klowdjs.doCarousels();
});

