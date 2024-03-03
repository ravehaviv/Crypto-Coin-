/// <reference path="jquery-3.7.0.js"/>


$(()=>{

    // count 5 time button
    let global_counter = 0;

    //save 5 coins for live reports
    const globalCoinsArr=new Set();


    //save data for 2 min
    const global_coins = new Map();

    //coins data on load
    let global_data ;

    
    

    


    //loader html

    function loading(){
    $(document).on(`load`,() =>{
        $(".lds-hourglass").removeClass("none");
    });
    $(".lds-hourglass").addClass("none");
    }

    loading();

    //hide canvas
    if (global_counter <5) {
        
        $("#chartContainer").hide();
        $(".liveReportsAl").show();
    }
    

    // Navigation Hendler
    $(".nav-link").on("click", function(){
        
        $(".nav-link").removeClass("active");
        $(this).addClass("active");

        $(".cry-page").removeClass("active");
        const page = $(this).data("page");
        $(page).addClass("active");
    });


     
    //first load
   async function load(){      
        global_data = await getJson(`https://api.coingecko.com/api/v3/coins/markets?order=market_cap_desc&vs_currency=usd`);
        displaycoins(global_data);

    }
    load();
    
    //search
    $(".cry-search").on("keyup", function() {

        const inputSearch  = $(".cry-search").val().toLowerCase();

        if (inputSearch.length > 0){
            $(".error-cry").html("");
            const regex = new RegExp(inputSearch, "i");
            
            let x = [];
            $.each(global_data,function (key,val) {
                if ((val.name.search(regex) != -1)) {
                    x.push(val);
                }
            });
            if(x.length===0){
                $(".error-cry").html("There is no crypto by this name");
            }else{
                displaycoins(x);
            }
        }
        else{
            displaycoins(global_data);
            
        }
    });
      
    
    //show more
    $(`body`).on("click",".btn-card-cry" ,  async function(){

        const id = $(this).data("b");
        
        
         $( `.uldata${id}`).append("<div class=`lds-hourglass`></div>");
        
        
        if($(this).data("press")){

            $(this).data("press",false);    
            
            //check if in map 
            if( global_coins.has(id) ){

                const obj = global_coins.get(id);
                const now = Date.now();
                
                if( ( now - obj.timestemp ) < (1000 * 120 ) ){
                    const Htmlul = displayHtmlul(obj.data);
                    $(`.uldata${id}`).html(Htmlul);
                }
            }else{
                //creat in map
                const id = $(this).data("b");
                const get_json =await getJson(`https://api.coingecko.com/api/v3/coins/`+id);
                global_coins.set( id, { data: get_json, timestemp: Date.now() } );
            
                const Htmlul = displayHtmlul(get_json);
                
                 $(`.uldata${id}`).html(Htmlul);
 
             }
        
        }
     else{
        $(this).data("press",true);
        $(`.uldata${id}`).html(""); }
        

    });

    //add coins to live reporte
    $(`body`).on("change",".switch" ,function(){
       
        
        if($(this).data("presss") && globalCoinsArr.size <= 5){

            const id = $(this).data("aa");

            global_counter++
            
            $(this).data("presss",false);

            if(globalCoinsArr.size < 5){
                globalCoinsArr.add(id);
            }
            
           if(global_counter > 5){

               
               const get_list = getlisthtml();
               $(`.modal-body`).html(get_list);
               $('#ListModal').modal('show');
               global_counter --;
               if($(".list").on("click",function(){
                   
                    const old_id=$(this).val();
                    globalCoinsArr.delete(old_id)
                    globalCoinsArr.add(id);
                    const get_list = getlisthtml();
                    $(`.modal-body`).html(get_list);
                    $('#ListModal').modal('hide');
                    $(".switchto"+old_id).attr('checked', false);
                    
                    
                }));        
            }
            
        }else{
             $(this).data("presss",true);
             global_counter--;
             id = $(this).data("aa");
             globalCoinsArr.delete(id);
        }
        
            
    });

    function getlisthtml(){
        let html=''
        for(let x of globalCoinsArr){
            html += `<input type="checkbox" name="${x}" class="list" value="${x}" checked>
                     <label for="${x}">${x}</label><br>`;
        }
        return html;
    }



    //display ul show more button

    function displayHtmlul(get_json){
     
        let Htmlul = 
            `
            <li><img src="${get_json.image.thumb}" alt=""</li>
            <li class ="shekel">ILS: ${get_json.market_data.current_price.ils}₪</li>
            <li>USD: ${get_json.market_data.current_price.usd}$</li>
            <li>EUR: ${get_json.market_data.current_price.eur}€</li>
            `;
            return Htmlul;
    }

    //display coins on load
    function displaycoins( coinsArr ){
        
        let html = "";
        for (let cryptoo of coinsArr){
            html += getCoinHtml(cryptoo);
        }
        
        $(".displaycoins").html(html);
        
    }


    //html for coins load
    function getCoinHtml(coin){
        const Html = 
        ` <div class="card">
        <div class="card-body">
        <h5 class="card-title">${coin.symbol}</h5>
        <h6 class="card-subtitle mb-2 text-muted">${coin.name}</h6>
        <br>
        <label class="switch cry-switch switch${coin.id}" data-aa="${coin.id}" data-presss="true">
        <input type="checkbox" class="chk switchto${coin.id}">
        <span class="slider"></span>
        </label>
        <button type="button" class="btn  btn-card-cry "data-b="${coin.id}"  data-press="true" aria-pressed="false" autocomplete="off">
        More Info
        </button>
        <ul class="uldata${coin.id} ul-cry" ></ul>
        </div>
        </div>`;
        return Html;
    }
    
      
    //ajax
    function getJson(url){
        return new Promise((resolve, reject) => {
            $.ajax({
                url,
                success: data => resolve(data),
                error: err => reject( err.statusText )
            })
        });
    }


    $(`body`).on("change",".switch" ,function(){

        if(global_counter >= 5){
            
            

            $("#chartContainer").show();
            $(".liveReportsAl").hide();

        let options = {
            animationEnabled: true,
            theme: "light2",
            title:{
                text: "Actual vs Projected Sales"
            },
            axisX:{
                valueFormatString: "DD MMM"
            },
            axisY: {
                title: "Number of Sales",
                suffix: "K",
                minimum: 30
            },
            toolTip:{
                shared:true
            },  
            legend:{
                cursor:"pointer",
                verticalAlign: "bottom",
                horizontalAlign: "left",
                dockInsidePlotArea: true,
                itemclick: toogleDataSeries
            },
            
            data: [{
                type: "line",
                showInLegend: true,
                name: "Projected Sales",
                markerType: "square",
                xValueFormatString: "DD MMM, YYYY",
                color: "#F08080",
                yValueFormatString: "#,##0K",
                dataPoints: [
                    { x: new Date(2017, 10, 1), y: 63 },
                    { x: new Date(2017, 10, 2), y: 69 },
                    { x: new Date(2017, 10, 3), y: 65 },
                    { x: new Date(2017, 10, 4), y: 70 },
                    { x: new Date(2017, 10, 5), y: 71 },
                    { x: new Date(2017, 10, 6), y: 65 },
                    { x: new Date(2017, 10, 7), y: 73 },
                    { x: new Date(2017, 10, 8), y: 96 },
                    { x: new Date(2017, 10, 9), y: 84 },
                    { x: new Date(2017, 10, 10), y: 85 },
                    { x: new Date(2017, 10, 11), y: 86 },
                    { x: new Date(2017, 10, 12), y: 94 },
                    { x: new Date(2017, 10, 13), y: 97 },
                    { x: new Date(2017, 10, 14), y: 86 },
                    { x: new Date(2017, 10, 15), y: 89 }
                ]
            },
            
            {
                type: "line",
                showInLegend: true,
                name: "Actual Sales",
                lineDashType: "dash",
                yValueFormatString: "#,##0K",
                dataPoints: [
                    { x: new Date(2017, 10, 1), y: 60 },
                    { x: new Date(2017, 10, 2), y: 57 },
                    { x: new Date(2017, 10, 3), y: 51 },
                    { x: new Date(2017, 10, 4), y: 56 },
                    { x: new Date(2017, 10, 5), y: 54 },
                    { x: new Date(2017, 10, 6), y: 55 },
                    { x: new Date(2017, 10, 7), y: 54 },
                    { x: new Date(2017, 10, 8), y: 69 },
                    { x: new Date(2017, 10, 9), y: 65 },
                    { x: new Date(2017, 10, 10), y: 66 },
                    { x: new Date(2017, 10, 11), y: 63 },
                    { x: new Date(2017, 10, 12), y: 67 },
                    { x: new Date(2017, 10, 13), y: 66 },
                    { x: new Date(2017, 10, 14), y: 56 },
                    { x: new Date(2017, 10, 15), y: 64 }
                ]
            }]
        };
        
        $("#chartContainer").CanvasJSChart(options);
        
        function toogleDataSeries(e){
            if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                e.dataSeries.visible = false;
            } else{
                e.dataSeries.visible = true;
            }
            e.chart.render();
        }

        
        }else{$("#chartContainer").hide();}
    });


});