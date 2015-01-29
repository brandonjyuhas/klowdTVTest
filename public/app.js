var fakeData =[
    {
      airings: [
        {
          program: {
            title: "How I Met Your Mother"
          },
          duration: 30
        },
        {
          program: {
            title: "How I Met Your Mother"
          },
          duration: 30
        },
        {
          program: {
            title: "Seinfeld"
          },
          duration: 30
        },
        {
          program: {
            title: "Dr. Oz Show"
          },
          duration: 60
        }


      ],
      id: 1121
    },
    {
      airings: [
        {
          program: {
            title: "James Bond"
          },
          duration: 90
        },
        {
          program: {
            title: "State Of The Union"
          },
          duration: 150
        },
        {
          program: {
            title: "How I Met Your Mother"
          },
          duration: 30
        }

      ],
      id: 1123
    },
    {
      airings: [
        {
          program: {
            title: "Scrubs"
          },
          duration: 30
        },
        {
          program: {
            title: "Scrubs"
          },
          duration: 30
        },
        {
          program: {
            title: "The Colbert Report"
          },
          duration: 30
        },
        {
          program: {
            title: "The Daily Show"
          },
          duration: 30
        },
        {
          program: {
            title: "Midnight Tonight"
          },
          duration: 30
        }

      ],
      id: 1125
    }
  ]



$('document').ready(function(){







  var klowdEPG = {

    activeStation: "23321",
    apikey: "umstwy76p8shpfkxhugr6a2v",
    baseUrl: "http://data.tmsapi.com/v1/lineups/USA-DC01098-X/grid",
    zipcode: "20002",


    findCorrectISOTime: function(date){
      date = date.toISOString().substr(0,16);
      if (parseInt(date.substr(14,2)) >= 30 ){
        return date.substring(0, 14) + "30Z"
      }
      else {
        return date.substring(0, 14) + "00Z"
      }
    },

    inArray: function(value, array){
      contains = false;
      for(var i = 0; i < array.length; i++){
        if(array[i] == value){
          contains = true;
        }
      }
      return contains;
    },


    // endTime: new Date(new Date(new Date().setHours(new Date().getHours() + 1)).setMinutes(new Date().getMinutes() + 30)).toISOString().substr(0,16) + "+05:00",
    stationIds: [11069,23321,11450,10051,10035,10057,11163],
    userIds: [11069,23321,10051,11163],


    // Hours Messed Up Due to TimeZone
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

    isUndefined: function(string){
      if(string){
        return string;
      }
      else{
        return '';
      }
    },

    fillEPG: function(data, today){
        for(var j = 0; j < data.length; j++){
          $('#programGuide').append("<div class='grid grid-pad'><div class='col-2-12'><div class='content'><img src='/images/" + data[j]["stationId"] + ".png' class='height-15-percent' /></div></div><div class='col-10-12'><div class='content'><ul class='programs inactive' channel-id='" + data[j]["stationId"] + "'></ul></div></div></div>");
          if (this.activeStation === data[j]["stationId"]){
            $('.programs').eq(j).addClass('active');
          }
          if (this.inArray(data[j]["stationId"].toString(), this.userIds)){
            $('.programs').eq(j).removeClass('inactive');
          }
          airings = data[j]["airings"];

          // duration of 2:30 minute block

          var durationLeft = 150;

          for(var i = 0; i < airings.length; i++){
            // Find how much time is left of first program
            if(i === 0){
              airings[i]["duration"] -= this.findTimeDifference(parseInt(airings[i]["startTime"].substr(11,2)), parseInt(airings[i]["startTime"].substr(14,2)), parseInt(today.substr(11,2)), parseInt(today.substr(14,2)));
            }


            if(durationLeft > 0){
              program = airings[i];
              if (durationLeft - program["duration"] < 0) {
                program["duration"] = durationLeft;
              }
              program = airings[i];

              // Handle finding all info here, and then push into one string that you'll append
              console.log(program["program"]["title"]);
              console.log(program["program"]["shortDescription"]);



              episodeTitle = this.isUndefined(program["program"]["episodeTitle"]);
              shortDescription = this.isUndefined(program["program"]["shortDescription"]).replace(/"/g,"'");

              console.log(shortDescription);
              console.log(" ");

              cast = "";



              if(data[j]["stationId"] === this.activeStation) {
                button = "";
              }
              else if(this.inArray(data[j]["stationId"].toString(), this.userIds)){
                  button = "&lt;button class=&quot;change-channel&quot; channel-id=&quot;"
                  + data[j]["stationId"]
                  + "&quot; &gt; Switch to Channel &lt;/button&gt;"
              }
              else {
                button = "&lt;button class=&quot;purchase&quot; channel-id=&quot;"
                  + data[j]["stationId"]
                  + "&quot; &gt; Purchase Channel &lt;/button&gt;"
              }

              if (program["program"]["topCast"]){
                cast += "&lt;ul&gt;"
                for (var actor = 0; actor < program["program"]["topCast"].length; actor++){
                  cast += "&lt;li&gt;" + program["program"]["topCast"][actor] + "&lt;/li&gt;"
                }
                cast += "&lt;/ul&gt;"
              }

              if (program["duration"] < 5) {
                program["duration"] = 0;
              }

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
                minuteDiff = (((program["duration"]) / 30 ) * 20 - 1);
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
          }
        }

      },

    addTimeBlock: function(time){
      time = new Date(time);
      time = new Date(time.setHours(time.getHours() + 2));
      time = new Date(time.setMinutes(time.getMinutes() + 30));
      $('.date').text(time.toString().substr(0,15));
      return this.findCorrectISOTime(time);
    },

    removeTimeBlock: function(time){
      time = new Date(time);
      time = new Date(time.setHours(time.getHours() - 2));
      time = new Date(time.setMinutes(time.getMinutes() - 30));
      $('.date').text(time.toString().substr(0,15));
      return this.findCorrectISOTime(time);
    },


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

    setTimeBar: function(today){
        for (var i = 0; i < 5; i++){
        var date = new Date(new Date(today).getTime() + ((i) * 30)*60000);
        var hours = date.getHours();
        var minutes = date.getMinutes();
        $('.half-hour').eq(i).html("<p>" + this.getHoursMinutes(hours, minutes) + "</p>");
      }
    },

    init: function(){
      klowd = this;
      $('.date').text(new Date().toString().substr(0,15));
      time = klowd.findCorrectISOTime(new Date());
      klowd.setEPG(time);

      $('#next').on('click', function(){
        if ($(this).data("executing")) return;

        $('#programGuide').empty();
        time = klowd.addTimeBlock(time);
        klowd.setEPG(time);
      });

      $('#previous').on('click', function(){
        if ($(this).data("executing")){
          return;
        }
        $('#programGuide').empty();
        time = klowd.removeTimeBlock(time);
        klowd.setEPG(time);
      });
    },

    setEPG: function(today){

      // Send query
      klowd = this;

      // Determine ISO 8601 in Zulu time (What Gracenote Uses)
      klowd.setTimeBar(today);
      // console.log(klowd.baseUrl);

      if (today === klowd.findCorrectISOTime(new Date())){
        $('#previous').hide();
      }
      else {
        $('#previous').show();
      }

      console.log("Today: " + today);

        $.ajax({
        url: klowd.baseUrl,
        data: {
          stationId: klowd.stationIds.toString(),
          startDateTime: today,
          // endDateTime: this.endDateTime,
          // jsonp: "dataHandler",
          api_key: klowd.apikey,
        },
        // datatype: "json",
      })
      .done(function(data){
        console.log(data);
        klowd.fillEPG(data, today);
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
      });

      // this.fillEPG(fakeData);
      // $('#next').on('click' this.)




    },
  }
  klowdEPG.init();

});