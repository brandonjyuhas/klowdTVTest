
;(function (window, document, $, R, undefined) {
    var breakPoints = {};
    jQuery.BreakPoint = function (id) {
	var callbacks,
	topic = id && breakPoints[id];
	if (!topic) {
            callbacks = jQuery.Callbacks();
            topic = {
		publish : callbacks.fire,
		subscribe : callbacks.add,
		unsubscribe : callbacks.remove
            };
            if (id) {
                breakPoints[id] = topic;
            }
        }
        return topic;
    };

    var BreakPointUtils = {
	breakPointSet : [{
            "name" : "XS",
            "lower" : 0,
            "upper" : 319
	}, {
            "name" : "S",
            "lower" : 320,
            "upper" : 479
	}, {
            "name" : "SM",
            "lower" : 480,
            "upper" : 559
        }, {
            "name" : "M",
            "lower" : 560,
            "upper" : 671
        }, {
            "name" : "MML",
            "lower" : 672,
            "upper" : 767
	}, {
            "name" : "ML",
            "lower" : 768,
            "upper" : 863
	}, {
            "name" : "MLL",
            "lower" : 864,
            "upper" : 959
	}, {
            "name" : "L",
            "lower" : 960,
            "upper" : 1023
	}, {
            "name" : "XL",
            "lower" : 1024,
            "upper" : 1199
	}, {
            "name" : "XXL",
            "lower" : 1200,
            "upper" : 1440
	}]
        ,matchedBreakPoints : []
        ,unMatchedBreakPoints : []
        ,publishBreakPoints : function () {
            BreakPointUtils.matchedBreakPoints.length = 0;
            BreakPointUtils.unMatchedBreakPoints.length = 0;
            $.each(BreakPointUtils.breakPointSet, function(index, point){
                BreakPointUtils.handleBreakPointOnlyEvents(point);
                BreakPointUtils.handleBreakPointAboveEvents(point);
                BreakPointUtils.handleBreakPointBelowEvents(point);
            });
            $.BreakPoint("publishComplete").publish({"matched" : BreakPointUtils.matchedBreakPoints, "unMatched" : BreakPointUtils.unMatchedBreakPoints});
        }
        ,handleBreakPointOnlyEvents : function(breakPoint){
            if(R.band(breakPoint.lower, breakPoint.upper)){
                BreakPointUtils.matchedBreakPoints.push(breakPoint.name+"-only");
                $.BreakPoint(breakPoint.name+"-only").publish();
            }else{
                BreakPointUtils.unMatchedBreakPoints.push(breakPoint.name+"-only");
                $.BreakPoint("off-"+breakPoint.name+"-only").publish();
            }
        }
        ,handleBreakPointAboveEvents : function(breakPoint){
            if (R.band(breakPoint.lower)) {
                BreakPointUtils.matchedBreakPoints.push(breakPoint.name+"-and-above");
                $.BreakPoint(breakPoint.name+"-and-above").publish();
            } else {
                BreakPointUtils.unMatchedBreakPoints.push(breakPoint.name+"-and-above");
                $.BreakPoint("off-"+breakPoint.name+"-and-above").publish();
            }
        }
        ,handleBreakPointBelowEvents : function(breakPoint){
            if (R.band(0, breakPoint.upper)) {
                BreakPointUtils.matchedBreakPoints.push(breakPoint.name+"-and-below");
                $.BreakPoint(breakPoint.name+"-and-below").publish();
            } else {
                BreakPointUtils.unMatchedBreakPoints.push(breakPoint.name+"-and-below");
                $.BreakPoint("off-"+breakPoint.name+"-and-below").publish();
            }
        }
    };

    R.ready(function(){
        Response.create({ 
            prop: "width" // property to base tests on
            ,prefix: "r" // custom aliased prefixes
            ,breakpoints: [0,320,480,560,672,768,864,960,1024,1200,1400] // custom breakpoints
            ,lazy: false // enable lazyloading
        });  
    });
    $(window).load(BreakPointUtils.publishBreakPoints);
    R.crossover(BreakPointUtils.publishBreakPoints, 'width');
    
}(window, window.document, window.jQuery, window.Response));

;(function($, undefined) {
    /*
        XS-only,XS-and-above
        S-only, S-and-above, S-and-below
        SM-only, SM-and-above, SM-and-below
        M-only, M-and-above, M-and-below
        MML-only, MML-and-above, MML-and-below
        ML-only, ML-and-above, ML-and-below
        MLL-only, MLL-and-above, MLL-and-below
        L-only, L-and-above, L-and-below
        XL-only, XL-and-above, XL-and-below
        XXL-only, XXL-and-above, XXL-and-below 
    */
    $.widget('klowdjs.baseResponseWidget', {
        
         //Options to be used as defaults
        options: {breakpoints: [], widgetStyle: ''}
        ,_create : function(){
            this._buildWidget();
            this._subscribeToBreakpoints();  
        }
        ,_subscribeToBreakpoints : function() {
            var widget = this;
            $.BreakPoint("publishComplete").subscribe($.proxy(widget._handleBreakPoints, widget));
        }
        ,_handleBreakPoints : function(breakPoints) {
            if(this._isWithinBreakpoint(breakPoints.matched)){this.activate();}
            else{this.deactivate();}
        }
        ,_isWithinBreakpoint : function (matchedBreakPoints){
            if(this.options.breakpoints == "all") {return true;}
            return $.grep(this.options.breakpoints, function(i)
            {return $.inArray(i, matchedBreakPoints) > -1;}).length > 0;
        }
    });
}(jQuery));
