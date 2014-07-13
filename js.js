if (document.getElementById && document.getElementsByTagName && document.createElement && document.createTextNode) {
    var pt = {
        // the body
        body: document.getElementsByTagName('body')[0],
        // the table
        tbl: document.getElementById('data'),
        // the thead
        hdrRow: document.getElementById('data').tHead,
        //utilitynav
        utilitynav: document.getElementById('utilitynav'),
        // number of columns in table; determined in init()
        allCols: 0,
        // number of rows in table; determined in init()
        allRows: 0,
        // this button will restore all inputs when clicked
        restoreBtn: document.createElement('input'),
        // this will be a node list of all the anchors surrounding icons
        iconNodeList: null,
        // count of all items in iconNodeList
        allIcons: 0,
        cookie: null,
        init: function(){
            this.util.configEvents();
            // determine number of columns
            this.allCols = this.tbl.rows[0].cells.length;
            // determine number of rows
            this.allRows = this.tbl.rows.length;
            this.actions.addIcons();
            this.actions.configRestoreBtn();
            this.util.addEvent(this.hdrRow, 'mouseover', this.actions.showHideIcons, false);
            this.util.addEvent(this.hdrRow, 'mouseout', this.actions.hideAllIcons, false);
            this.util.addEvent(this.hdrRow, 'focus', this.actions.showHideIcons, true);
            this.util.addEvent(this.hdrRow, 'blur', this.actions.hideAllIcons, true);
            this.util.addEvent(this.hdrRow, 'focusin', this.actions.showHideIcons, false);
            this.util.addEvent(this.hdrRow, 'focusout', this.actions.hideAllIcons, false);
            this.util.addEvent(this.hdrRow, 'click', this.actions.modifyTable, false);
            this.util.addEvent(this.restoreBtn, 'click', this.actions.showAllColumns, false);
            // metaprogramming to rewrite event and XHR handling
            this.util.configEvents();
            this.util.configXHR();
            
			var changesRefresh = setInterval(this.ls.pullNewData, 300);
            
			if (this.cookie !== null) {
            this.actions.readCookieIndexes();
            }
        },
        fade: {
            // flag for tracking fades to prevent multiple overlapping timers
            fadeInProgress: false,
            // timer for fade
            fadeTimer: null,
            // counter for fade out
            fadeOutCounter: 10,
            // index number of column being faded out
            columnToFade: null,
            fadeColumn: function(){
                // move down the opacity level by 1
                pt.fade.fadeOutCounter -= 1;
                if (pt.fade.fadeOutCounter >= 0) {
                    for (var i = 0; i < pt.allRows; i++) {
                        pt.tbl.rows[i].cells[pt.fade.columnToFade].className = 'op' + pt.fade.fadeOutCounter;
                    }
                } else {
                    // wipe the timer
                    clearInterval(pt.fade.fadeTimer);
                    // reset counter back to full opacity for next column to be faded
                    pt.fade.fadeOutCounter = 10;
                    // flip the 'in progress' flag back to false
                    pt.fade.fadeInProgress = false;
                    // remove the column entirely
                    for (var i = 0; i < pt.allRows; i++) {
                        pt.tbl.rows[i].cells[pt.fade.columnToFade].className = 'rem';
                    }
                    // make the 'Show Hidden Columns' button appear
                    pt.restoreBtn.className = '';
                }
            }
        },
        actions: {
            getColIndexes: function(){
                var hdr = document.getElementById('hdr');
                var ths = hdr.getElementsByTagName('th');
                pt.cookie = ' ';
                var i;
                for (i = 0; i < ths.length; i++) {
                    pt.cookie += ths[i].cellIndex + ',';
                }
                pt.util.createCookie('colOrder', pt.cookie);
            },
            readCookieIndexes: function(){
                var cook = pt.util.findCookie('colOrder').split(",");
                for (var i = 0; i < 4; i++) {
                    alert(parseFloat(cook[i]));
					var col = i;
                    if (col === 0 || (col === 1 && /rem/.test(pt.tbl.rows[0].cells[0].className))) {
                        pt.actions.shiftToLastColumn(col);
                    } // otherwise check into moving the second column in front of the first column (which is visible)
 					else if (col === 1 && !/rem/.test(pt.tbl.rows[0].cells[0].className)) {
                        pt.actions.shiftByOneColumn(col, 0);
                    } else {
                        // the column we want to be placed before (to the left of)
                        // is 1 less than the current column number
                        // adjust the column number to reflect hidden columns
                        var inFrontOf = parseFloat(cook[i]+1);
                        // move column to end of table if it is moving to the left and there is nothing but hidden columns there
                        if (inFrontOf === 0 && /rem/.test(pt.tbl.rows[0].cells[0].className)) {
                            pt.actions.shiftToLastColumn(col);
                        } else {
                            pt.actions.shiftByOneColumn(col, inFrontOf);
                        }
                    }
                }
            },
            addIcons: function(){
                var tabNum = 10;
                // populate row with cells containing images and anchors
                for (var i = 0; i < pt.allCols; i++) {
                    var container = document.createElement('span');
                    var anchor1 = document.createElement('a');
                    var anchor2 = document.createElement('a');
                    var anchor3 = document.createElement('a');
                    anchor1.href = anchor2.href = anchor3.href = "#";
                    anchor2.className = 'nonIE';
                    anchor1.tabIndex = tabNum;
                    tabNum += 10;
                    anchor2.tabIndex = tabNum;
                    tabNum += 10;
                    anchor3.tabIndex = tabNum;
                    tabNum += 10;
                    var img1 = document.createElement('img');
                    var img2 = document.createElement('img');
                    var img3 = document.createElement('img');
                    img1.src = 'i/left-arrow.png';
                    img1.alt = img1.title = 'Click to shift this column to the left';
                    img2.src = 'i/hide.png';
                    img2.alt = img2.title = 'Click to hide column';
                    img3.src = 'i/right-arrow.png';
                    img3.alt = img3.title = 'Click to shift this column to the right';
                    container.appendChild(anchor1).appendChild(img1);
                    container.appendChild(anchor2).appendChild(img2);
                    container.appendChild(anchor3).appendChild(img3);
                    pt.tbl.rows[0].cells[i].appendChild(container);
                    // build a node list of all anchors surrounding the icons
                    pt.iconNodeList = pt.hdrRow.getElementsByTagName('a');
                    pt.allIcons = pt.iconNodeList.length;
                }
            },
            // set up the 'Show Hidden Columns' button
            configRestoreBtn: function(){
                pt.restoreBtn.type = 'button';
                pt.restoreBtn.value = 'Show Hidden Columns';
                pt.restoreBtn.id = 'restore';
                pt.restoreBtn.className = 'rem';
                document.getElementById('pageHdr').appendChild(pt.restoreBtn);
            },
            showHideIcons: function(evt){
                // locate the th cell moused over in thead
                var th = pt.util.findTarget(evt, 'th', this);
                // if no th cell was involved, exit the function
                if (!th) {
                    return;
                }
                // hide all icons in the header row
                pt.actions.hideAllIcons();
                // show just the icons for the th moused over      
                th.id = 'current';
            },
            // check for hidden columns and move past them
            // first parameter is the column number to check initially
            // second parameter is the direction of the shift
            skipHiddenColumns: function(col, dir){
                if (dir === 'left') {
                    // shift to the left and stop at 0 (first column)
                    while (col > 0) {
                        // keep moving to the left as long as the column is hidden
                        if (/rem/.test(pt.tbl.rows[0].cells[col].className)) {
                            col--;
                        } else {
                            break;
                        }
                    }
                } else {
                    // shift to the right and stop at the end
                    while (col < pt.allCols) {
                        // keep moving to the right as long as the column is hidden
                        if (/rem/.test(pt.tbl.rows[0].cells[col - 1].className)) {
                            col++;
                        } else {
                            break;
                        }
                    }
                }
                // send back the column number
                return col;
            },
            modifyTable: function(evt){
                // track down anchor clicked
                var linkClicked = pt.util.findTarget(evt, 'a', this);
                // if click was not on an anchor then stop
                if (!linkClicked) {
                    return;
                }
                // shut down href
                pt.util.stopDefault(evt);
                // determine the column number
                var col = linkClicked.parentNode.parentNode.cellIndex;
                // use the title of the image inside the anchor to determine what action to take
                switch (linkClicked.firstChild.title) {
                    case 'Click to shift this column to the left':
                        // if we are shifting the second column [1] to the left and the first column [0]
                        // is hidden, then move that second column to the end of the table
                        // also move to end of table if column being moved is the first one
                        if (col === 0 || (col === 1 && /rem/.test(pt.tbl.rows[0].cells[0].className))) {
                            pt.actions.shiftToLastColumn(col);
                        } // otherwise check into moving the second column in front of the first column (which is visible)
 else if (col === 1 && !/rem/.test(pt.tbl.rows[0].cells[0].className)) {
                            pt.actions.shiftByOneColumn(col, 0);
                        } else {
                            // the column we want to be placed before (to the left of)
                            // is 1 less than the current column number
                            // adjust the column number to reflect hidden columns
                            var inFrontOf = pt.actions.skipHiddenColumns(col - 1, 'left');
                            // move column to end of table if it is moving to the left and there is nothing but hidden columns there
                            if (inFrontOf === 0 && /rem/.test(pt.tbl.rows[0].cells[0].className)) {
                                pt.actions.shiftToLastColumn(col);
                            } else {
                                pt.actions.shiftByOneColumn(col, inFrontOf);
                            }
                        }
                        break;
                    case 'Click to shift this column to the right':
                        // if we are moving the next-to-last column and the last column is visible, then shift it over
                        if (col === pt.allCols - 2 && !/rem/.test(pt.tbl.rows[0].cells[pt.allCols - 1].className)) {
                            pt.actions.shiftToLastColumn(col);
                        } // if we are moving the next-to-last column and the last column is hidden, shift
                    // the next-to-last column to the beginning of the table
                        else if (col === pt.allCols - 2 && /rem/.test(pt.tbl.rows[0].cells[pt.allCols - 1].className)) {
                            pt.actions.shiftByOneColumn(col, 0);
                        } // otherwise check for as many hidden columns as necessary and proceed as normal
 else {
                            // adjust the column number to reflect hidden columns
                            var inFrontOf = pt.actions.skipHiddenColumns(col + 2, 'right');
                            // if we're in the last column (allCols - 1) then we need
                            // to be in front of the 0 column
                            if (col === pt.allCols - 1) {
                                pt.actions.shiftByOneColumn(col, 0);
                            } // if we have moved all the way off the table...
 else if (inFrontOf === pt.allCols) {
                                // ... and the last column is hidden, then shift current column to start of table
                                if (/rem/.test(pt.tbl.rows[0].cells[pt.allCols - 1].className)) {
                                    pt.actions.shiftByOneColumn(col, 0);
                                } // ... otherwise the last column is visible so put it after the last column
 else {
                                    pt.actions.shiftToLastColumn(col);
                                }
                            } // otherwise move as necessary within the middle columns
 else {
                                pt.actions.shiftByOneColumn(col, inFrontOf);
                            }
                        }
                        break;
                    case 'Click to hide column':
                        // pass the column number so the function knows which one to remove from display
                        pt.actions.removeColumn(col);
                        break;
                }
                // renumber the tab indexes for the icons
                pt.actions.resetTabindexes();
                //call get Col Indexes
                pt.actions.getColIndexes();
            },
            // loop through the anchors holding the icons and reassign tabindexes
            resetTabindexes: function(){
                for (var i = 0, tabNum = 10; i < pt.allIcons; i++, tabNum += 10) {
                    pt.iconNodeList[i].tabIndex = tabNum;
                }
            },
            // shifts column to left or right
            // first parameter is current column number
            // second parameter is the column number that the shifted column will precede
            shiftByOneColumn: function(colNumber, inFrontOf){
                for (var i = 0; i < pt.allRows; i++) {
                    pt.tbl.rows[i].insertBefore(pt.tbl.rows[i].cells[colNumber], pt.tbl.rows[i].cells[inFrontOf]);
                }
            },
            shiftToLastColumn: function(colNumber){
                for (var i = 0; i < pt.allRows; i++) {
                    pt.tbl.rows[i].appendChild(pt.tbl.rows[i].cells[colNumber]);
                }
            },
            removeColumn: function(colNumber){
                // prevent concurrent fade outs
                if (pt.fade.fadeInProgress) {
                    return;
                }
                pt.fade.fadeInProgress = true;
                pt.fade.columnToFade = colNumber;
                pt.fade.fadeTimer = setInterval(pt.fade.fadeColumn, 50);
            },
            // remove all id's from header cells, thus hiding the icons
            hideAllIcons: function(){
                for (var i = 0; i < pt.allCols; i++) {
                    pt.tbl.rows[0].cells[i].id = '';
                }
            },
            // full-table scan that removes classes, thus restoring hidden cells
            // also removes the 'Show Hidden Comments' button from view
            showAllColumns: function(){
                pt.restoreBtn.className = 'rem';
                // loop first by rows
                for (var i = 0; i < pt.allRows; i++) {
                    // and then by cells in each row
                    for (var x = 0; x < pt.allCols; x++) {
                        pt.tbl.rows[i].cells[x].className = '';
                    }
                }
            }
        },
        ls: {
            // reference to the text input box
            //searchTextBox : document.getElementById('recentchanges'),
            recentChangesDiv: document.getElementById('recentchanges'),
            //results ul
            resultsArea: document.getElementById('recentchanges').getElementsByTagName('ul'),
            // div that holds the waiting message
            waitingHolder: document.createElement('div'),
            // initially there is no waiting message
            waitMsg: false,
            // initially there is no timer set
            timer: null,
            // this will hold the XMLHttpRequest data
            changesData: null,
            // store the XML data in the searchData property of this object
            holdChangesResults: function(xhr){
                pt.ls.changesData = xhr.responseXML;
                pt.ls.displayResults();
            },
            // function called periodically to refresh the xml data
            pullNewData: function(){
                pt.util.sendRequest('data/changes.xml?' + Math.random(), pt.ls.holdChangesResults);
            },
            displayResults: function(){
                // shorthands
                var data = pt.ls.changesData;
                // determine the total number of possible results for subsequent loops
                var totalResults = data.getElementsByTagName('item').length;
                // test to see if the container exists in the DOM
                // if it exists, erase the news content by removing it
                // this is an alternative to using innerHTML
                if (pt.ls.recentChangesDiv !== null) {
                    pt.utilitynav.removeChild(pt.ls.recentChangesDiv);
                }
                //recreate and append 'recentchanges' div
                var changesArea = document.createElement('div');
                changesArea.id = 'recentchanges';
                pt.utilitynav.appendChild(changesArea);
                // create and append the Search Results header
                var searchHeader = document.createElement('h2');
                var searchHdrTxt = document.createTextNode('Recent Changes');
                changesArea.appendChild(searchHeader).appendChild(searchHdrTxt);
                //create and append ul
                var changesUl = document.createElement('ul');
                changesUl.id = 'changesUl';
                changesArea.appendChild(changesUl);
                //add list items
                for (var i = 0; i < totalResults; i++) {
                    var ul = document.getElementById('changesUl');
                    var newli = document.createElement('li');
                    var newLink = document.createElement('a');
                    newLink.href = data.getElementsByTagName('url')[i].firstChild.nodeValue;
                    newLink.title = data.getElementsByTagName('title')[i].firstChild.nodeValue;
                    var linkText = document.createTextNode(data.getElementsByTagName('code')[i].firstChild.nodeValue);
                    var status = data.getElementsByTagName('status')[i].firstChild.nodeValue;
                    var stat = document.createTextNode(' ' + status);
                    ul.appendChild(newli).appendChild(newLink).appendChild(linkText);
                    ul.appendChild(newli).appendChild(stat);
                }
            }
        },
        util: {
            configEvents: function(){
                if (document.addEventListener) {
                    this.addEvent = function(el, type, func, capture){
                        el.addEventListener(type, func, capture);
                    };
                    this.stopBubble = function(evt){
                        evt.stopPropagation();
                    };
                    this.stopDefault = function(evt){
                        evt.preventDefault();
                    };
                    this.findTarget = function(evt, targetNode, container){
                        var currentNode = evt.target;
                        while (currentNode && currentNode !== container) {
                            if (currentNode.nodeName.toLowerCase() === targetNode) {
                                return currentNode;
                                break;
                            } else {
                                currentNode = currentNode.parentNode;
                            }
                        };
                        
                        return false;
                    };
                } else if (document.attachEvent) {
                    this.addEvent = function(el, type, func){
                        el["e" + type + func] = func;
                        el[type + func] = function(){
                            el["e" + type + func](window.event);
                        };
                        el.attachEvent("on" + type, el[type + func]);
                    };
                    this.stopBubble = function(evt){
                        evt.cancelBubble = true;
                    };
                    this.stopDefault = function(evt){
                        evt.returnValue = false;
                    };
                    this.findTarget = function(evt, targetNode, container){
                        var currentNode = evt.srcElement;
                        while (currentNode && currentNode !== container) {
                            if (currentNode.nodeName.toLowerCase() === targetNode) {
                                return currentNode;
                                break;
                            } else {
                                currentNode = currentNode.parentNode;
                            }
                        };
                        
                        return false;
                    };
                }
            },
            createCookie: function(name, value, expiration, path, domain, secure){
                var data = name + "=" + escape(value);
                if (expiration) {
                    var expiresAt = new Date();
                    expiresAt.setTime(expiration);
                    data += "; expires=" + expiresAt.toGMTString();
                }
                if (path) {
                    data += "; path=" + path;
                }
                if (domain) {
                    data += "; domain=" + domain;
                }
                if (secure) {
                    data += "; secure";
                }
                document.cookie = data;
            },
            findCookie: function(name){
                var query = name + "=";
                var queryLength = query.length;
                var cookieLength = document.cookie.length;
                var i = 0;
                while (i < cookieLength) {
                    var position = i + queryLength;
                    if (document.cookie.substring(i, position) === query) {
                        return this.findCookieValue(position);
                    }
                    i = document.cookie.indexOf(" ", i) + 1;
                    if (i === 0) {
                        break;
                    }
                }
                return null;
            },
            findCookieValue: function(position){
                var endsAt = document.cookie.indexOf(";", position);
                if (endsAt === -1) {
                    endsAt = document.cookie.length;
                }
                return unescape(document.cookie.substring(position, endsAt));
            },
            eraseCookie: function(name){
                if (this.findCookie(name)) {
                    var data = name + "=";
                    data += "; expires=Thu, 01-Jan-70 00:00:01 GMT";
                    document.cookie = data;
                }
            },
            sendRequest: function(url, func, postData){
                var xhr = this.createXHR();
                if (!xhr) {
                    return;
                }
                var method = (postData) ? "POST" : "GET";
                xhr.open(method, url, true);
                xhr.setRequestHeader('User-Agent', 'XHR');
                if (postData) {
                    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                }
                xhr.onreadystatechange = function(){
                    if (xhr.readyState !== 4) {
                        return;
                    }
                    if (xhr.status !== 200 && xhr.status !== 304) {
                        alert('HTTP error ' + xhr.status);
                        return;
                    }
                    func(xhr);
                };
                if (xhr.readyState === 4) {
                    return;
                }
                xhr.send(postData);
            },
            XHRoptions: [function(){
                return new XMLHttpRequest()
            }, function(){
                return new ActiveXObject("Msxml2.XMLHTTP")
            }, function(){
                return new ActiveXObject("Msxml3.XMLHTTP")
            }, function(){
                return new ActiveXObject("Microsoft.XMLHTTP")
            }
]            ,
            XHRmethod: null,
            configXHR: function(){
                var xmlhttp = false;
                for (var i = 0, allOptions = this.XHRoptions.length; i < allOptions; i++) {
                    try {
                        xmlhttp = this.XHRoptions[i]();
                    } catch (e) {
                        continue;
                    }
                    break;
                }
                this.XHRmethod = i;
                this.createXHR = function(){
                    var xmlhttp = this.XHRoptions[this.XHRmethod]();
                    return xmlhttp;
                }
            }
        }
    };
    pt.init();
}
