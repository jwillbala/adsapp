var myContacts = myApp.virtualList($$(".contacts"), {
    // Pass array with items
    //items: items,
    items: [],
    // Custom search function for searchbar
    searchAll: function (query, items) {
        var found = [];
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if ($(item).text().indexOf(query) >= 0 || query.trim() === '') {
                found.push(i);
            }
        }
        return found; //return array with mathced indexes
    },
    // Item height
    height: 73
});

$(window).on("load", function () {
    //alert(dateFormat(new Date(), "yyyy-mm-dd hh:MM:ss"));
    //loadingHide();

});
$$(document).on("submit", "form", function (e) {
    //alert(1);
    e.preventDefault();
    return false;
});

$(document).ready(function () {

    if (typeof localStorage.userId === "undefined") {
        view2.router.loadPage('welcome.html', {ignoreCache: true});
    }

    // Android layout fix
    if (localStorage.os === "Android") {
        $('.navbar').attr('style', 'top: -10px !important');
        $('.banner').css("margin-top", "-11px");
        $('#toplogo').css("margin-top", "10px");
    }

    // Get data and fill
    getSession();

    // Global timer
    setInterval(function () {
        pageCheck();
    }, 300);

    // Global timer
    setInterval(function () {
        conexCheck();
    }, 500);

    setTimeout(function () {
        ajaxPing();
    }, 1000);

});

function pageRefresh() {
    var page = myApp.getCurrentView().activePage.name;
    var view = myApp.getCurrentView().container.id;
    var t = 0;
    // grupos
    if (page === "index") {
        groupChatList();
        t = 0;
    }
    // contatos
    if (page === "index-2") {
        contactList();
        t = 0;
    }
    // chat list
    if (page === "index-3") {
        chatList();
        t = 0;
    }
    // profile
    if (page === "index-4") {
        profileLoad();
    }
    // chat inner
    if (page === "messages") {

        if (sessionStorage.chatType === "priv8") {
            chatGet();
        }
        if (sessionStorage.chatType === "group") {
            groupChatGet();
        }

        t = 1000;
    }
    // run again
    if (t > 0) {
        pageRefreshRun(t);
    }

}
function pageRefreshRun(t) {
    pageRefreshTimer = setTimeout(function () {
        pageRefresh();
    }, t);
}
function pageCheck() {
    var page = myApp.getCurrentView().activePage.name;
    if (page !== sessionStorage.activePage) {
        sessionStorage.activePage = page;
        if (typeof pageRefreshTimer !== "undefined") {
            clearInterval(pageRefreshTimer);
        }
        pageRefresh();
        getSession();
        console.log("change page to " + page);
    }
}
function getSession() {
    //
    debug();
    //
    $("[data-session-key]").each(function (index) {
        var key = $(this).attr("data-session-key");
        var type = $(this).attr("data-session-type");
        var attr = $(this).attr("data-session-attr");

        if (type === "html") {
            $(this).html(sessionStorage[key]);
        }
        if (type === "css") {
            $(this).css(attr, sessionStorage[key]);
        }
        if (type === "attr") {
            $(this).attr(attr, sessionStorage[key]);
        }
        if (type === "value") {
            $(this).attr(attr, sessionStorage[key]);
        }
    });

}
function conexCheck() {
    // Houve alteração no status de conexão?
    if (sessionStorage.onlineLast !== sessionStorage.online) {
        if (sessionStorage.online === "true") {
            $('#conexCheck').html("<span style='color:#6ccb5e'><img src='img/online.png' style='vertical-align:bottom' /> &nbsp; Conexão estabelecida</span>");
        }
        else {
            $('#conexCheck').html("<span style='color:#e95651'><img src='img/offline.png' style='vertical-align:bottom' /> &nbsp; Você está offline</span>");
        }
        sessionStorage.onlineLast = sessionStorage.online;
    }

}

$$(document).on('click', 'a.tab-link', function (e) {
    var href = $(this).attr("href");
    $('.toolbar-inner a[href="' + href + '"]').addClass("active");
});

$$(document).on('pageBeforeInit', '*', function (e) {
    //alert(1);
    //$('#toolbar').show();
    getSession();
});

$$(document).on('pageBack', '*', function (e) {
    $('#toolbar').show(); // back from messages
});

myApp.onPageInit('*', function (page) {
    //
});