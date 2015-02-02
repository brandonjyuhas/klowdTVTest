$('document').ready(function(){

  var klowdEPG = {

    // Active station will be pulled from URL possibly
    activeStation: "23321",
    // Array of all stations
    stationIds: [11069,23321,11450,10051,10035,10057,11163],
    // Stations the user is subscribed to
    userStations: [11069,23321,10051,11163],
    apikey: "umstwy76p8shpfkxhugr6a2v",
    baseUrl: "http://data.tmsapi.com/v1/lineups/USA-DC01098-X/grid",
    zipcode: "20002",

    // Use klowdjs to determine how many hours to show
    findEPGSize: function() {
        breakpoint = klowdjs.breakpoints.getBreakpoint();
        if (breakpoint > 768) { epgHours = 2; epgMinutes = 30; } else
        if (breakpoint > 560) { epgHours = 1; epgMinutes = 30; } else
        { epgHours = 1; epgMinutes = 0; }
        return { hours: epgHours, minutes: epgMinutes };
    },

    // Convert the js Date object to a format acceptable by gracenote
    findCorrectISOTime: function(date){
      date = date.toISOString().substr(0,16);
      if (parseInt(date.substr(14,2)) >= 30 ){
        return date.substring(0, 14) + "30Z"
      }
      else {
        return date.substring(0, 14) + "00Z"
      }
    },

    // Determine if an item is in an array (used to determine whether channels are available to usrs or not, returning true or false)
    inArray: function(value, array){
      contains = false;
      for(var i = 0; i < array.length; i++){
        if(array[i] == value){
          contains = true;
        }
      }
      return contains;
    },


    // Determine difference in minutes between two times (used to determine how many minutes is left in a show)
    findTimeDifference: function(startHour, startMin, currentHour, currentMin){
      if(startHour > currentHour){
        diff = (24 - startHour + currentHour)
        diff = diff * 60 + currentMin - startMin;
      }
      else {
        diff = (currentHour - startHour);
        diff = diff * 60 + currentMin - startMin;
      }

      return diff;
    },

    // If gracenote does not have a field such as short description for a particular show, replace it with an empty string
    isUndefined: function(string){
      if(string){
        return string;
      }
      else{
        return '';
      }
    },

    // Actually create the elements that are added to the EPG
    fillEPG: function(data, today, hours, minutes){
      // Parse through the data provided by gracenote
      for(var j = 0; j < data.length; j++){
        // Check to see if we are in mobile view or not
        if (klowdjs.breakpoints.getBreakpoint() < 768){
          var row = "<div class='grid grid-pad'><div class='col-2-12'><div class='content station'><img src='/images/" + data[j]["stationId"] + ".png' class='height-10-percent' /><p>" + data[j]["channel"] + ": " + data[j]["callSign"] + "</p></div></div><div class='col-10-12'><div class='content'><ul class='programs inactive' channel-id='" + data[j]["stationId"] + "'></ul></div></div></div>"
        }
        else {
          var row = "<div class='grid grid-pad'><div class='col-2-12'><div class='content'><img src='/images/" + data[j]["stationId"] + ".png' class='height-10-percent' /></div></div><div class='col-10-12'><div class='content'><ul class='programs inactive' channel-id='" + data[j]["stationId"] + "'></ul></div></div></div>"
        }

        // Add the row to the table
        $('#programGuide').append(row);

        // Highlight the channel if it's what we're currently watching
        if (this.activeStation === data[j]["stationId"]){
          $('.programs').eq(j).addClass('active');
        }
        // Remove the inactive coloring for stations
        if (this.inArray(data[j]["stationId"].toString(), this.userStations)){
          $('.programs').eq(j).removeClass('inactive');
        }
        var airings = data[j]["airings"];

        // Find the amount of minutes being displayed
        var durationLeft = (hours * 60) + minutes;

        for(var i = 0; i < airings.length; i++){
          // Find how much time is left of current program by subtracting the difference between start time and current time
          if(i === 0){
            airings[i]["duration"] -= this.findTimeDifference(parseInt(airings[i]["startTime"].substr(11,2)), parseInt(airings[i]["startTime"].substr(14,2)), parseInt(today.substr(11,2)), parseInt(today.substr(14,2)));
          }

          // Make sure that there's time left in the epg row
          if(durationLeft > 0){
            program = airings[i];
            if (durationLeft - program["duration"] < 0) {
              program["duration"] = durationLeft;
            }
            program = airings[i];

            // Handle finding all info here, and then push into one string that you'll append to the row
            // Replace all double quotes so that we don't break out of the title attribute
            episodeTitle = this.isUndefined(program["program"]["episodeTitle"]).replace(/"/g,"'");
            shortDescription = this.isUndefined(program["program"]["shortDescription"]).replace(/"/g,"'");

            // No button if it's the channel you're on
            if(data[j]["stationId"] === this.activeStation) {
              button = "";
            }
            // Link to channel if you have the channel
            else if(this.inArray(data[j]["stationId"].toString(), this.userStations)){
                button = "&lt;button class=&quot;change-channel&quot; channel-id=&quot;"
                + data[j]["stationId"]
                + "&quot; &gt; Switch to Channel &lt;/button&gt;"
            }
            // Link to purchase the channel if you do not
            else {
              button = "&lt;button class=&quot;purchase&quot; channel-id=&quot;"
                + data[j]["stationId"]
                + "&quot; &gt; Purchase Channel &lt;/button&gt;"
            }

            // If top cast is provided by gracenote, created a ul with each actor as an li
            var cast = "";
            if (program["program"]["topCast"]){
              cast += "&lt;ul&gt;"
              for (var actor = 0; actor < program["program"]["topCast"].length; actor++){
                cast += "&lt;li&gt;" + program["program"]["topCast"][actor] + "&lt;/li&gt;"
              }
              cast += "&lt;/ul&gt;"
            }

            // Need to figure out how to avoid blank spaces where an element that isn't large enough to be displayed
            if (program["duration"] < 2) {
              program["duration"] = 0;
            }

            // Append a li for the program, combining all of the information we have into the tooltip
            if(program["duration"] > 0){
              $('.programs').eq(j).append("<li class='tooltip' title=\"&lt;h2&gt;"
                + (program["program"]["title"])
                + "&lt;/h2&gt; &lt;h3&gt;"
                + episodeTitle
                + "&lt;/h3&gt; &lt;p&gt;"
                + shortDescription
                + " &lt;/p&gt; &lt;/br&gt; "
                + cast
                + button
                + "\" class='tooltip'>"
                + program["program"]["title"]
                + "</li>");
              currentProgram = $('.programs li').last();
              // Determine how large li will be based on how wide the timeline is are
              if (hours === 2)   { minuteDiff = (((program["duration"]) / 30 ) * 20 - 1);  } else
              if (minutes === 30){ minuteDiff = (((program["duration"]) / 30 ) * 33.33 - 1)} else
                                 { minuteDiff = (((program["duration"]) / 30 ) * 50 - 1);  }
              if(minuteDiff > 100){
                minuteDiff = "99%";
              }
              else{
                minuteDiff = minuteDiff + "%";
              }
              currentProgram.width(minuteDiff);
              durationLeft -= program["duration"];
            }
          }
          // If we're out of time in the display, break out of the for loop
          else {
            break;
          }
        }
      }
    },

    // Move forward in time by making api call and resetting the EPG
    addTimeBlock: function(time, hours, minutes){
      time = new Date(time);
      time = new Date(time.setHours(time.getHours() + hours));
      time = new Date(time.setMinutes(time.getMinutes() + minutes));
      $('.date').text(time.toString().substr(0,15));
      return this.findCorrectISOTime(time);
    },

    // Move backward in time by making api call and resetting the EPG
    removeTimeBlock: function(time, hours, minutes){
      time = new Date(time);
      time = new Date(time.setHours(time.getHours() - hours));
      time = new Date(time.setMinutes(time.getMinutes() - minutes));
      $('.date').text(time.toString().substr(0,15));
      return this.findCorrectISOTime(time);
    },

    // Stylize times
    getHoursMinutes: function(hours, minutes){
      var meridiem = "AM";
      if (hours > 12){
        hours -= 12;
        meridiem = "PM";
      }
      else if(hours == 00){
        hours = 12;
      }
      if (minutes >= 30){
        minutes = ":30";
      }
      else {
        minutes = ":00";
      }
      return hours + minutes + meridiem;
    },

    // Place time blocks into the timebar
    setTimeBar: function(today, hours, minutes){
        // Determine how many 30 minute blocks to create
        var length = (hours * 2);
        if (minutes > 0){
          length += 1;
        }
        for (var i = 0; i < length; i++){
          var date = new Date(new Date(today).getTime() + ((i) * 30)*60000);
          var hours = date.getHours();
          var minutes = date.getMinutes();
          $('#time').append('<li class="half-hour"><p>' + this.getHoursMinutes(hours, minutes) + '</p></li>');
        }
        // Determine size based on thirty min blocks
        if (length === 5){ $('.half-hour').width('20%'); } else
        if (length === 3){ $('.half-hour').width('33.33%'); } else
                         { $('.half-hour').width('50%'); }
    },

    // Function attached to next button that moves the epg forward
    addTime: function(){
      // Remove the class temporarily to prevent users from spamming the button
      $('#next').removeClass('next');
      // Empty the EPG of its current contents
      $('#programGuide').empty();
      // Remove the half hours from the timebar
      $('.half-hour').remove();
      // Figure out how large the epg's scope is based off of screen size
      hoursMins = klowd.findEPGSize();
      // Find new time by adding time to current time
      time = klowd.addTimeBlock(time, hoursMins["hours"], hoursMins["minutes"]);
      // Run the setEPG method again with the new time, and total hours and minutes being displayed as arguments
      klowd.setEPG(time, hoursMins["hours"], hoursMins["minutes"]);

    },

    // Function attached to the previous button that moves the epg backwards
    removeTime: function(){
      // Remove the class temporarrily to prevent users from spamming the button
      $('#previous').removeClass('previous');
      // Empty the EPG of its current contents
      $('#programGuide').empty();
      // Remove the half hours from the timebar
      $('.half-hour').remove();
      // Figure out how large the epg's scope is based off of the screen size
      hoursMins = klowd.findEPGSize();
      // Find new time by removing time to current time
      time = klowd.removeTimeBlock(time, hoursMins["hours"], hoursMins["minutes"]);
      // Run the setEPG method again with the new time, and total hours and minutes being displayed as arguments
      klowd.setEPG(time, hoursMins["hours"], hoursMins["minutes"]);
    },

    // On initialization
    init: function(){
      // Change the text of the date object to todays date
      $('.date').text(new Date().toString().substr(0,15));
      // Figure out the time right now
      time = this.findCorrectISOTime(new Date());
      // Find EPG size in terms of hours and minutes displayed
      hoursMins = this.findEPGSize();
      // Set the EPG using the current time and the hours and minutes being displayed as arguments
      this.setEPG(time, hoursMins["hours"], hoursMins["minutes"]);
      // Add the functionality to the next and previous button
      $('.next').on('click', this.addTime);
      $('.previous').on('click', this.removeTime);
    },

    setEPG: function(today, hours, minutes){

      // Set 'this' as a variable so I can access it in the ajax
      klowd = this;

      // Determine ISO 8601 in Zulu time (What Gracenote Uses)
      klowd.setTimeBar(today, hours, minutes);

      // If you're looking at the current time, you can't go back, so remove the previous button
      if (today === klowd.findCorrectISOTime(new Date())){
        $('#previous').hide();
      }
      else {
        $('#previous').show();
      }

      // Send request to gracenote
      $.ajax({
        url: klowd.baseUrl,
        data: {
          stationId: klowd.stationIds.toString(),
          startDateTime: today,
          api_key: klowd.apikey,
        },
      })
      .done(function(data){
        // Fill the EPG with the data we just pulled
        klowd.fillEPG(data, today, hours, minutes);
        // Initialize tooltipster for the clickable information
        $('.tooltip').tooltipster({
        trigger: 'click',
        contentAsHTML: true,
        interactive: true,
        functionReady: function(){
            $('.change-channel').on( 'click', function(){
            channelId = $(this).attr('channel-id');
            $('.programs').removeClass('active');
            $('.programs[channel-id="' + channelId +'"]').addClass('active');
            klowd.activeStation = channelId;
            $('.tooltip').tooltipster('hide');
          });
        }
      });

      // Add classes back to the next and previous buttons so that they have the functionality of switching time slots
      $('#next').addClass('next');
      $('#previous').addClass('previous');
    });
  },
}

  klowdEPG.init();

});