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

    activeStation: 1123,
    apikey: "umstwy76p8shpfkxhugr6a2v",
    baseUrl: "http://data.tmsapi.com/v1/lineups/USA-DC01098-X/grid",
    zipcode: "20002",
    d: new Date(),
    today: new Date().toISOString().substr(0,16) + "+05:00",
    endTime: new Date(new Date(new Date().setHours(new Date().getHours() + 1)).setMinutes(new Date().getMinutes() + 30)).toISOString().substr(0,16) + "+05:00",
    stationIds: "11069,23321,11450",


    // Hours Messed Up Due to TimeZone
    findTimeDifference: function(startHour, startMin, endHour, endMin){
      diff = (endHour - startHour) * 60 + endMin - startMin;
      return diff
    },

    fillEPG: function(data){
        for(var j = 0; j < data.length; j++){
          $('#EPG').append("<div class='grid grid-pad'><div class='col-1-12'><div class='content'><img src='/images/" + data[j]["id"] + ".png' class='height-15-percent' /></div></div><div class='col-11-12'><div class='content'><ul class='programs' channel-id='" + data[j]["id"] + "'></ul></div></div></div>");
          if (this.activeStation === data[j]["id"]){
            $('.programs').eq(j).addClass('active');
          }
          airings = data[j]["airings"];
          var durationLeft = 150;
          for(var i = 0; i < airings.length; i++){
            if(durationLeft > 0){
              program = airings[i];
              if (durationLeft - program["duration"] < 0) {
                program["duration"] = durationLeft;
              }
              program = airings[i];
              $('.programs').eq(j).append("<li title='&lt;h2&gt;" + program["program"]["title"] + "&lt;/h2&gt; &lt;p&gt; A brief description of the show or episode of the show, possibly even more data. &lt;/p&gt; &lt;/br&gt; &lt;button class=&quot;change-channel&quot; channel-id=&quot;" + data[j]["id"] + "&quot; &gt; Switch to Channel &lt;/button &gt;' class='tooltip'>" + program["program"]["title"] + "</li>");
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

    setHalfHours: function(){

      var minutes = 0;
      },

    setTimeBar: function(){
        for (var i = 0; i < 5; i++){
        var date = new Date(new Date().getTime() + ((i) * 30)*60000);
        var hours = date.getHours();
        var minutes = date.getMinutes();
        $('.half-hour').eq(i).html("<p>" + this.getHoursMinutes(hours, minutes) + "</p>");
      }
    },

    init: function(){
            console.log(this.today);
      // Send query
      console.log(this.endTime);
      klowd = this;

      this.setTimeBar();
      console.log(this.baseUrl)

      // endDateTime = this.today.substr
      this.fillEPG(fakeData);

      $('.tooltip').tooltipster({
        trigger: 'click',
        contentAsHTML: true,
        interactive: true,
        functionReady: function(){
                $('.change-channel').on( 'click', function(){
                  channelId = $(this).attr('channel-id');
                  $('.programs').removeClass('active');
                  $('.programs[channel-id="' + channelId +'"]').addClass('active');
                  $('.tooltip').tooltipster('hide');
                });
        }
      });



    }

    // init: function(){
    //   console.log(this.today);
    //   // Send query
    //   console.log(this.endTime);
    //   klowd = this;

    //   this.setTimeBar();
    //   console.log(this.baseUrl)

    //   // endDateTime = this.today.substr

    //   $.ajax({
    //     url: this.baseUrl,
    //     data: {
    //       stationId: this.stationIds,
    //       startDateTime: this.today,
    //       endDateTime: this.endDateTime,
    //       // jsonp: "dataHandler",
    //       api_key: this.apikey,
    //     },
    //     // datatype: "json",
    //   })
    //   .done(function(data){
    //     console.log(data);
    //     for(var j = 0; j < data.length; j++){
    //       $('#channels').append("<ul><img src='/images/abc.png' /></ul>");
    //       airings = data[j]["airings"];
    //       $('#programs').append("<ul>");
    //       var durationLeft = 150;
    //       for(var i = 0; i < airings.length; i++){
    //         if (durationLeft > 0) {
    //           console.log(durationLeft)
    //           program = airings[i];
    //           console.log(program["endTime"]);
    //           $('#programs ul').eq(j).append("<li>" + program["program"]["title"] + "</li>");
    //           currentProgram = $('#programs li').last();
    //           minuteDiff = (((program["duration"]) / 30 ) * 20);
    //           if(minuteDiff > 100){
    //             minuteDiff = "100%";
    //           }
    //           else{
    //             minuteDiff = minuteDiff + "%";
    //           }
    //           currentProgram.width(minuteDiff);
    //           durationLeft -= program["duration"];
    //         }

    //       }
    //       $('#programs').append("</ul>");
    //     }
    //   });
    // }
  }
  klowdEPG.init();

});


// + getHoursMinutes(program["startTime"].substr(11, 2),program["startTime"].substr(14, 2)) + "-" + getHoursMinutes(program["endTime"].substr(11, 2),program["endTime"].substr(14, 2)


// http://data.tmsapi.com/v1/lineups/USA-DC63682-X/grid?stationId=11581&startD…01-19T17%3A04%3A25.841Z&jsonp=dataHandler&api_key=umstwy76p8shpfkxhugr6a2v