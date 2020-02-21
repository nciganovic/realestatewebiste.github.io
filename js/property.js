$(document).ready(function(){
    console.log("property.js");

    //Recive localsotrage from main.js
    var localStatus = localStorage.getItem("status");
    var localType = localStorage.getItem("type");
    var localRoom = localStorage.getItem("room");
    var localLocation = localStorage.getItem("location");
    var localTypeSep = localStorage.getItem("typeSep")
    var localLocationSep = localStorage.getItem("locationSep");

    console.log(localStatus, localType, localRoom, localLocation);

    //If no cookies from main.js show all
    $.ajax({
        url : "data/properties.json",
        method: 'GET', 
        type: 'json',
        success: function(data) { 
            updateFilters(data);
            showProperties(data);

            if(localStatus || localType || localRoom || localLocation){
                var dataFromLocalStorage = checkStorageFromIndex(data, localStatus, localType, localRoom, localLocation);
                showProperties(dataFromLocalStorage);
            }

            if(localTypeSep){
                var dataWithTypes = filterDataWithSingleParameter(data, localTypeSep, "type");
                showProperties(dataWithTypes);
            }

            if(localLocationSep){
                var dataWithTypes = filterDataWithSingleParameter(data, localLocationSep, "location");
                showProperties(dataWithTypes);
            }
            
            
        },
        error: function(xhr, error, status) {
            console.log(xhr);
        }
    });

    $("#min-price").change(checkValue);
    $("#max-price").change(checkValue);
    $("#min-rooms").change(checkValue);
    $("#max-rooms").change(checkValue);

    $("#btn-filter").click(function(){
        var allFilters = getFilterData();
        console.log(allFilters);

        $.ajax({
            url : "data/properties.json",
            method: 'GET', 
            type: 'json',
            success: function(data) { 
                var filteredData = filterData(data, allFilters);
                showProperties(filteredData);
            },
            error: function(xhr, error, status) {
                console.log(xhr);
            }
        });
    })

    $(".btn-search").click(function(){
        var search = $("#search").val();
        
        $.ajax({
            url : "data/properties.json",
            method: 'GET', 
            type: 'json',
            success: function(data) { 
                var newData = searchForData(data, search);
                showProperties(newData);
            },
            error: function(xhr, error, status) {
                console.log(xhr);
            }
        });
    })

    $(".close-modal").click(function(event){
        event.preventDefault();
        $("#modal").addClass("d-none");
        $("#modal").removeClass("d-flex");
    })

    //Favorites
    $(".add-fav").click(function(e){
        e.preventDefault();
        var id = $(this).attr("item");
        var allData;

        $.ajax({
            url : "data/properties.json",
            method: 'GET', 
            type: 'json',
            success: function(data) { 
                for(d of data){
                    if(d.id == id){
                        var thisItem = d;
                    }
                }
                var favorites = localStorage.getItem("fav");
                console.log(favorites);
                var favParsed = JSON.parse(favorites);
                console.log(favParsed);
                addOrRemoveFavorites(favParsed, thisItem);
            },
            error: function(xhr, error, status) {
                console.log(xhr);
            }
        });

    });

    

})

function updateFilters(data){
    var allStatuses = [];
    var allTypes = [];
    var allLocations = [];
    var allPrices = [];
    var allRooms = [];

    for(d of data){
        if(!allStatuses.includes(d.status)){
            allStatuses.push(d.status);
        }
        if(!allTypes.includes(d.type)){
            allTypes.push(d.type);
        }
        if(!allLocations.includes(d.location)){
            allLocations.push(d.location);
        }
        if(!allPrices.includes(d.price)){
            var str = d.price;
            var removeDot = str.replace(".", "");
            var number = Number(removeDot);
            allPrices.push(number);
        }
        if(!allRooms.includes(d.rooms)){
            var num = Number(d.rooms);
            allRooms.push(num);
        }
    }

    var maxPrice = Math.max.apply(Math, allPrices); 
    var maxRooms = Math.max.apply(Math, allRooms); 
   
    $("#max-price").attr("value", maxPrice);
    $("#max-rooms").attr("value", maxRooms);
    $("#max-price").attr("max", maxPrice);
    $("#max-rooms").attr("max", maxRooms);
    
    makeSelectTag(allStatuses, "Status");
    makeSelectTag(allTypes, "Type");
    makeSelectTag(allLocations, "Location");

}

function showProperties(data){
    console.log(data);
    html = "";
    for(d of data){
        html += `
        <div class="col-xl-4 col-lg-6 mt-3">
                <span class="image-block img-hover">
                    <a class="image-zoom" href="images/g1.jpg" data-gal="prettyPhoto[gallery]">
                        <img src="images/${d.img}" class="img-fluid " alt="${d.title}">
                    </a>
                </span>
                <div class="property-info-list">
                    <div class="detail">
                        <h4 class="title">
                            <a href="single.html">${d.title}</a>
                        </h4>
                        <div class="location mt-2 mb-2">
                            <a href="single.html">
                               <i class="fas fa-map-marker-alt"></i> ${d.location},  ${d.date}
                            </a>
                        </div>
                        <ul class="facilities-list clearfix">
                            <li class="mt-2 mb-2">
                                <i class="fas fa-bed"></i> ${d.rooms} Bedrooms
                            </li>
                            <li class="mt-2 mb-2">
                                <i class="fas fa-bath"></i> ${d.status}
                            </li>
                            <li class="mt-2 mb-2">
                                <i class="far fa-building"></i> ${d.type}
                            </li>
                            <li class="mt-2 mb-2">
                                <i class="far fa-building"></i> ${d.price}
                            </li>
                        </ul>
                    </div>
                    <div class="footer-properties">
                        <a class="admin" href="#">
                            <i class="fa fa-user"></i> ${d.owner}
                        </a>
                        <span>
                            <a class="open-modal" item="${d.id}" href="">Read more <i class="fas fa-arrow-right"></i></a>
                        </span>
                    </div>
                </div>
            </div>
        `
    }

    $("#property-card-holder").html(html);

    $(".open-modal").click(function(event){
        event.preventDefault();
        $("#modal").removeClass("d-none");
        $("#modal").addClass("d-flex");
        showSpecificModal(this, data);

        var id = $(this).attr("item");
        var favorites = localStorage.getItem("fav");
        
        if(favorites){
            var favParsed = JSON.parse(favorites);
            for(obj of favParsed){
                console.log(obj.id, id);
                if(obj.id == id){
                    $(".add-fav").text("Remove from favorites");
                    break;
                }
                else{
                    $(".add-fav").text("Add to favorites");
                }
            }
        }
        else{
            $(".add-fav").text("Add to favorites");
        }
        
    })
}

function makeSelectTag(data, name){
    html = `<option value='0'>${name}</option>`;
    for(d of data){
        html += `<option value="${d}">${d}</option>`
    }
    var nameToLow = name.toLowerCase();
    $(`[name='${nameToLow}']`).html(html);
}

function checkValue(){
    console.log(this);
    var id = $(this).attr("id");
    var getNames = id.split("-");
    var maxMin = getNames[0];
    var priceRoom = getNames[1];

    var maxValue = $(this).attr("max");
    console.log("MAX VALUE = ", maxValue);


    if(maxMin == "max" && priceRoom == "price"){
        var strA = document.getElementById("min-price").value;
        var strB = document.getElementById("max-price").value;
        
        var a = Number(strA);
        var b = Number(strB);

        console.log("--MAX-PRICE--");
        console.log(a,b);
        console.log("A ->", typeof(a));
        console.log("B ->", typeof(b));

        if(b < a){
            document.getElementById("max-price").value = a;
        }
        if(b > maxValue){
            document.getElementById("max-price").value = maxValue;
        }
    }
    else if(maxMin == "min" && priceRoom == "price"){
        var strA = document.getElementById("min-price").value;
        var strB = document.getElementById("max-price").value;

        var a = Number(strA);
        var b = Number(strB);

        console.log("--MIN-PRICE--");
        console.log(a,b);
        console.log("A ->", typeof(a));
        console.log("B ->", typeof(b));

        if(a > b){
            console.log(a, "is bigger then", b);
            document.getElementById("min-price").value = b;
        }
        if(a < 0){
            document.getElementById("min-price").value = 0;
        }
    }
    else if(maxMin == "max" && priceRoom == "rooms"){
        var strC = document.getElementById("min-rooms").value;
        var strD = document.getElementById("max-rooms").value;

        var c = Number(strC);
        var d = Number(strD);

        if(d < c){
            document.getElementById("max-rooms").value = c;
        }
        if(d > maxValue){
            document.getElementById("max-rooms").value = maxValue;
        }
    }
    else if(maxMin == "min" && priceRoom == "rooms"){
        var strC = document.getElementById("min-rooms").value;
        var strD = document.getElementById("max-rooms").value;

        var c = Number(strC);
        var d = Number(strD);
        if(c > d){
            document.getElementById("min-rooms").value = d;
        }
        if(c < 0){
            document.getElementById("min-rooms").value = 0;
        }
    }
     
}

function getFilterData(){
    var status = $(`[name='status']`).val();
    var maxPrice = Number($("#max-price").val());
    var minPrice = Number($("#min-price").val());
    var type = $(`[name='type']`).val();
    var location = $(`[name='location']`).val();
    var minRooms = Number($("#min-rooms").val());
    var maxRooms = Number($("#max-rooms").val());
    var orderBy = $(`[name='orderby']`).val();

    var filterData = {
        "status": status,
        "minPrice": minPrice,
        "maxPrice": maxPrice,
        "type": type,
        "location": location,
        "minRooms": minRooms,
        "maxRooms": maxRooms,
        "orderby": orderBy
    }

    return filterData;
}

function filterData(data, filters){
    var filteredData = data;
    console.log("PRE status", filteredData);
    
    for(idx in filteredData){
        // filter on status
        if(filters.status != "0"){
            if(filters.status != filteredData[idx].status){
                delete filteredData[idx];
                continue;
            }
                
        }

        // filter on price
        var price = strToNumber(filteredData[idx].price);
        if(price > filters.maxPrice || price < filters.minPrice){
            delete filteredData[idx];
            continue;
        }

        // filter on rooms
        if(Number(filteredData[idx].rooms) > filters.maxRooms || Number(filteredData[idx].rooms) < filters.minRooms){
            delete filteredData[idx];
            continue;
        }

        // filter on type
        if(filters.type != "0"){
            if(filters.type != filteredData[idx].type){
                delete filteredData[idx];
                continue;
            } 
        }

        // filter on location
        if(filters.location != "0"){
            if(filters.location != filteredData[idx].location){
                delete filteredData[idx];
                continue;
            }   
        }
    }
    
    var filtered = filteredData.filter(function (el) {
        return el != null;
    });

    console.log("No null data ----->", filtered)
       
    var orderedData = orderData(filtered, filters.orderby);
    
    console.log("After sorting ----->", orderedData);

    console.log("POST status", filteredData);
    return filtered;
}

function strToNumber(str){
    var x = str.replace(".", "");
    var y = Number(x);
    return y;
}

function orderData(data, orderby){
    console.log(orderby);
    if(orderby == "ap"){
        data.sort((a,b) => {
            var a = strToNumber(a.price);
            var b = strToNumber(b.price);
            if(a > b)
                return 1;
            else if(a < b)
                return -1;
            else 
                return 0;
        });
    
        return data;
    }
    else if(orderby == "dp"){
        data.sort((a,b) => {
            var a = strToNumber(a.price);
            var b = strToNumber(b.price);
            if(a > b)
                return -1;
            else if(a < b)
                return 1;
            else 
                return 0;
        });
    
        return data;
    }
    else if(orderby == "new"){
        data.sort((a,b) => {
            var dateA = new Date(a.date);
            var dateB = new Date(b.date);
            if(dateA > dateB)
                return -1;
            else if(a < b)
                return 1;
            else 
                return 0;
        });
    
        return data;
    }
    else if(orderby == "old"){
        data.sort((a,b) => {
            var dateA = new Date(a.date);
            var dateB = new Date(b.date);
            if(dateA > dateB)
                return 1;
            else if(a < b)
                return -1;
            else 
                return 0;
        });
    
        return data;
    }
    
}

function searchForData(data, search){
    var newData = [];
    for(d of data){
        var title = d.title;
        var rgx = new RegExp(`${search.toLowerCase()}`)
        var isFound = rgx.test(title.toLowerCase());
        console.log(d.title, "-->", isFound);
        if(isFound){
            newData.push(d);
        }
    }

    return newData;
}

function showSpecificModal(item, data){
    console.log(item);
    var id = $(item).attr("item");
    var specItem;
    $(".modal-info").html("");
    for(d of data){
        if(d.id == id){
            specItem = `
                    <li>${d.title}</li>
                    <li>${d.location}</li>
                    <li>${d.status}</li>
                    <li>${d.type}</li>
                    <li>${d.price}</li>
                    <li>${d.rooms}</li>
                `
            $(".modal-info").html(specItem);

            $(".add-fav").attr("item", id);
        }
    }
}

function addOrRemoveFavorites(storage, thisItem){
    if(storage){
        console.log("There is something in storage.");
        var isThisItemInStorage = false;
        for(obj of storage){
            console.log(obj.id, thisItem.id)
            if(obj.id == thisItem.id){
                console.log("This object is in storage");
                isThisItemInStorage = true;
                //DELETE THIS ITEM FROM STORAGE
                // 1. get storage, 2. delete this item from storage 3. set this as new storage
                var favorites = localStorage.getItem("fav");
                var favParsed = JSON.parse(favorites);
                
                for(idx in favParsed){
                    if(favParsed[idx].id == thisItem.id){
                        delete favParsed[idx];
                        break;
                    }
                }

                var noNullFav = favParsed.filter(function (el) {
                    return el != null;
                });

                if(noNullFav.length == 0){
                    console.log("No items left in localstorage.");
                    localStorage.removeItem("fav");
                }
                else{
                    console.log("There are still items left in storage.");
                    var stringFav = JSON.stringify(noNullFav);
                    localStorage.setItem("fav", stringFav);
                    console.log(localStorage.getItem("fav"));
                }

                $(".add-fav").text("Add to favorites");
                break;
            }
        }
        if(!isThisItemInStorage){
            //If there are some items in storage but not this one
            var favorites = localStorage.getItem("fav");
            var favParsed = JSON.parse(favorites);    
            favParsed.push(thisItem);
            var stringFav = JSON.stringify(favParsed);
            localStorage.setItem("fav", stringFav);
            console.log(localStorage.getItem("fav")); 

            $(".add-fav").text("Remove from favorites");
        }
    }
    else{
        //SET ITEM IN STORAGE
        console.log("There is nothing in storage.");
        var newFavList = [];
        newFavList.push(thisItem);
        var stringFav = JSON.stringify(newFavList);
        localStorage.setItem("fav", stringFav);
        console.log(localStorage.getItem("fav"));

        $(".add-fav").text("Remove from favorites");
    }
}

function checkStorageFromIndex(data, localStatus, localType, localRoom, localLocation){
    var newData = [];
    for(d of data){
        if(localStatus){
            if(d.status != localStatus){
                continue;
            }
        }
        if(localType){
            if(d.type != localType){
                continue;
            }
        }
        if(localRoom){
            if(d.rooms != localRoom){
                continue;
            }
        }
        if(localLocation){
            if(d.location != localLocation){
                continue;
            }
        }            
        newData.push(d);    
    }
    console.log("New Data: ", newData);
    return newData;
}

function filterDataWithSingleParameter(data, param, filter){
    var newData = [];
    for(d of data){
        if(d[filter] == param){
            newData.push(d);
        }
    }
    return newData;
}