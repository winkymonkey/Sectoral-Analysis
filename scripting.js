$(document).ready(function() {
    const SECTOR = 'sector';
    const STOCK = 'stock';
    
    $('#exchange_bse').prop("checked", true);
    $('.exchange').on('click', function() {
        toggleExchangeRadio($(this));
    });
    
    
    $(document).ajaxSend(function() {
		addOverlay();
	});
    
    $("#sectorSubmit").on('click', function() {
        generateSectorReport('sectorname', 'asc');
    });
    
    $(document).on('click', '.expand', function() {                     //VIEW STOCK DETAILS
        viewStocks($(this));
    });
    
    $(document).on('click', '.dataHeader', function() {                 //SORTING
        if ($(this).hasClass('sectorname')) {
            generateSectorReport('sectorname', 'asc');
        }
        else if($(this).hasClass('marketcapcurrent')) {
            generateSectorReport('marketcapcurrent', 'desc');
        }
        else if($(this).hasClass('companyname')) {
            generateStockReport($(this).attr('sectorID'), 'companyname', 'asc');
        }
        else if($(this).hasClass('current')) {
            generateStockReport($(this).attr('sectorID'), 'current', 'desc');
        }
        else if($(this).hasClass('currentMarketCap')) {
            generateStockReport($(this).attr('sectorID'), 'currentMarketCap', 'desc');
        }
        else if($(this).hasClass('percentChange')) {
            generateStockReport($(this).attr('sectorID'), 'percentChange', 'desc');
        }
    });
    
    
    
    
    // BUSINESS FUNCTIONS
    function viewStocks(elem) {
        generateStockReport(elem.attr('sector'), 'companyname', 'asc');
        $('td').removeClass('selected');
        elem.siblings().addClass('selected');
    }
    
    function generateSectorReport(sortByField, sortOrder) {
        $('#sectors_table').empty();
        $('#stocks_table').empty();
        
        let exchange = $("input[name='exchange']:checked").val();
        let settings = {
            "url": "https://etmarketsapis.indiatimes.com/ET_Stats/sectorperformance?pagesize=100&exchange="+exchange+"&pageno=1&sortorder="+sortOrder+"&sortby="+sortByField, 
            "method": "GET", 
            "timeout": 0
        };

        $.ajax(settings).done(function (response) {
            let _trHeader = $('<thead>').append($('<th class="dataHeader">').text('#'),
                                                $('<th class="dataHeader sectorname">').text("Sector Name"), 
                                                $('<th class="dataHeader">').text("No of companies"), 
                                                $('<th class="dataHeader marketcapcurrent">').text("Market Capital (\u20B9 Cr.)"), 
                                                $('<th>').text()
                                        );
            $.each(response.searchresult, function(i, sector) {
                let sectorId = sector.sectorId;
				let _trRows = $('<tr>').append($('<td>').text('#'+i),
                                               $('<td>').text(sector.sectorName), 
                                               $('<td>').text(sector.sectorConstituents.length), 
                                               $('<td>').text(formatInCrores(sector.marketCap)),
                                               $('<td class="expand" sector="'+sector.sectorId+'">').html('View Stocks \u00BB')
									   );
				$('#sectors_table').append(_trHeader).append(_trRows);
			});
            removeOverlay();
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            removeOverlay();
            flashErrorMsg(SECTOR);
        });
    }
    
    function generateStockReport(sectorID, sortByField, sortOrder) {
        $('#stocks_table').empty();
        
        let exchange = $("input[name='exchange']:checked").val();
        let settings = {
            "url": "https://etmarketsapis.indiatimes.com/ET_Stats/sectorcompanylisting?pagesize=100&exchange="+exchange+"&pageno=1&sortby="+sortByField+"&sortorder="+sortOrder+"&sectorid="+sectorID, 
            "method": "GET", 
            "timeout": 0
        };
        
        $.ajax(settings).done(function (response) {
            let _trHeader = $('<thead>').append($('<th class="dataHeader">').text('#'),
                                                $('<th sectorId="'+sectorID+'" class="dataHeader companyname">').text("Company Name"), 
                                                $('<th sectorId="'+sectorID+'" class="dataHeader current">').text("Current Price"), 
                                                $('<th sectorId="'+sectorID+'" class="dataHeader currentMarketCap">').text("Market Capital (\u20B9 Cr.)"), 
                                                $('<th sectorId="'+sectorID+'" class="dataHeader percentChange">').text("% Change")
                                        );
            $.each(response.searchresult, function(i, company) {
                let href = 'https://economictimes.indiatimes.com/'+company.seoName+'/stocks/companyid-'+company.companyId+'.cms';
				let _trRows = $('<tr>').append($('<td>').text('#'+i),
                                               $('<td>').text(company.companyName), 
                                               $('<td>').text(company.current.toFixed(2)), 
                                               $('<td>').text(formatInCrores(company.currentMarketCap)), 
                                               $('<td>').text(company.percentChange.toFixed(2)),
                                               $('<td>').html('<a href="'+href+'" target="_blank">Know more \u2197</a>')
									   );
				$('#stocks_table').append(_trHeader).append(_trRows);
			});
            manageColors();
            scrollTop();
            removeOverlay();
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            removeOverlay();
            flashErrorMsg(STOCK);
        });
    }
    
    
    
    
    // UTILITY FUNCTIONS
    function toggleExchangeRadio(elem) {
        $('.exchange').prop('checked', false);
        elem.prop('checked', true);
    }
    
    function formatInCrores(input) {
        let num = (Number(input).toFixed() / 10000000).toFixed(2);
        let numFormatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return numFormatted;
    }
    
    function manageColors() {
        $('#stocks_table tr td:nth-child(5)').each(function(){
            //console.log($(this).text());
            let val = $(this).text();
            let addClass, removeClass;
            if (val !== "" && !isNaN(val)) {
                val = Number(val);

                addClass = (val > 0 ? "numPos" : "numNeg" );
                removeClass = ( val > 0 ? "numNeg" : "numPos" );

                $(this).addClass( addClass );
                $(this).removeClass( removeClass );
            }
        });
    }
    
    function scrollTop() {
        $("html, body").animate({ scrollTop: 0 }, "slow");
    }
    
    function addOverlay() {
        $("#overlay").fadeIn(300);
    }
    
    function removeOverlay() {
        setTimeout(function(){
            $("#overlay").fadeOut(300);
        },500);
    }
    
    function flashErrorMsg(type) {
        if (type === SECTOR) {
            $("#sectorError").fadeIn(500);
            setTimeout(function(){
                $("#sectorError").fadeOut(500);
            },1500);
        }
        else if (type === STOCK) {
            $("#stockError").fadeIn(500);
            setTimeout(function(){
                $("#stockError").fadeOut(500);
            },1500);
        }
    }
    
});