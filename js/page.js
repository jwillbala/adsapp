/* SESSION:
 * .activePage = pagina atual
 * .oldPage = pagina anterior
 * .post_id = active post_read.html
 * .post_id_list = last id for postList (old posts)
 * .post_id_list_new = last id for postList (new posts)
 * .edit_id = se > 0, active post.html (editar)
 * .friend_id = active user user_read.html
 * .chat_user = active user chat.html
 * .chat_id = last chat id loaded (for limit)
 * .chat_id_list = last chat id for chatList()
 *
 */
//============================
// GLOBAL EVENTS
//============================
$(window).on("load", function () {
    loadingHide();

});

$$(document).on("submit", "form", function (e) {
    e.preventDefault();
    return false;
});

//============================
// READY
//============================
$(document).ready(function () {

    if (typeof localStorage.user_id === "undefined") {
        go("user_login.html");
        $(".toolbar").hide();
        return false;
    }

    // Android layout fix
    if (localStorage.os === "Android") {
        $('.navbar').attr('style', 'top: -10px !important');
        $('.banner').css("margin-top", "-11px");
        $('#toplogo').css("margin-top", "10px");
    }

    userRead(localStorage.user_id, userReadCb_Me);
    userAds(localStorage.user_id, userAdsCb_Me);

    // Post list
    postList("post_id > 0");

    // Global timer
    setInterval(function () {
        pageCheck();
    }, 300);

    // Global timer
    setInterval(function () {
        conexCheck();
    }, 500);

    setTimeout(function () {
        //ajaxPing();
    }, 1000);


});

function pageRefresh() {
    var page = myApp.getCurrentView().activePage.name;
    var old_page = sessionStorage.oldPage;
    var view = myApp.getCurrentView().container.id;
    var t = 0;
    // paginas sem toolbar
    if (page !== "post_form"
            && page !== "user_read"
            && page !== "user_form"
            && page !== "user_login"
            && page !== "post_form"
            && page !== "user_register"
            && page !== "chat") {
        $("#toolbar_on").fadeIn("fast");
        $("#toolbar_off").fadeOut("fast");
    } else {
        $("#toolbar_on, #toolbar_off").hide();
    }
    // novo post
    if (page === "post_form") {
        $("#toolbar_off").show();
        $("#toolbar_on").fadeOut("fast");
        setMask();
        postCat(postCatCb);
    }
    // ver post
    if (page === "post_read") {
    }
    // timeline
    if (page === "index") {
        if (sessionStorage.loadIndex > 0) {
            if ($('#post_list').children().length === 0) {
                postList(0, "", true); // followers
            }
        } else {
            sessionStorage.loadIndex = 1;
        }
        // atualizou followers
        if (typeof sessionStorage.refreshFollow !== "undefined") {
            sessionStorage.removeItem("refreshFollow");
            $('#post_list').html("");
            postList(0, "", true); // followers
        }
    }
    // chat list
    if (page === "index-3") {
        chatList(0);
        t = 10000;
    }
    if (page === "index-2") {
        if ($('#post2_list').children().length === 0) {
            //postGrid();
            myApp.showIndicator();
            postListGrid("post_id > 0");
        }

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
        sessionStorage.oldPage = sessionStorage.activePage;
        sessionStorage.activePage = page;
        if (typeof pageRefreshTimer !== "undefined") {
            clearInterval(pageRefreshTimer);
        }
        pageRefresh();
        //getSession();
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
            $('#conexCheck').html("<span style='color:#6ccb5e'><img src='img/online.png' style='vertical-align:bottom' /> &nbsp; Conectado</span>");
        } else {
            $('#conexCheck').html("<span style='color:#e95651'><img src='img/offline.png' style='vertical-align:bottom' /> &nbsp; Você está offline</span>");
        }
        sessionStorage.onlineLast = sessionStorage.online;
    }

}

$$(document).on('click', 'a.tab-link', function (e) {
    var href = $(this).attr("href");
    $('.toolbar-inner a[href="' + href + '"]').addClass("active");
});

$$(document).on('click', '[data-open]', function (e) {
    var url = $(this).attr("data-open");
    go_browser(url);
});

$$(document).on('pageBack', '*', function (e) {
    $('#toolbar').show(); // back from messages
});

myApp.onPageInit('*', function (page) {
    //var name = myApp.getCurrentView().activePage.name;
    //console.log("aaa=" + name);
});


//==============================================
// GO INDEX (REFRESH)
//==============================================
function loadingShow(cb) {
    if (!$(".loaderx").length) {
        $("body").append('<div class="loaderx"><div><img src="img/loading.gif" /></div></div>');
    }
    $(".loaderx").fadeIn("fast", cb);
}
function loadingHide(cb) {
    $(".loaderx").fadeOut("fast", cb);
}
$$(document).on('click', '.go_index', function (e) {
    myApp.confirm('Tem certeza disto?', 'Voltar à home', function () {
        go_index();
    });
});
function go_index() {
    loadingShow(function () {
        window.location.href = "index.html";
    });
}

//==============================================
// FILL FORM WITH OBJECT DATA
//==============================================
function FF(data, form_elem) {

    console.log("FF() :)");

    console.log(data);

    if (typeof form_elem === "undefined") {
        form_elem = "form";
    }
    console.log(form_elem);

    var $elem = $(form_elem);
    var i = 0;
    for (i = 0; i < data.length; i++) {
        $.each(data[i], function (k, v) {
            console.log(k + "=" + v);
            if (v !== null) {
                var n = "[name=" + k + "]";
                var input = "";
                input += "textarea" + n + ",";
                input += "select" + n + ",";
                input += "[type=text]" + n + ",";
                input += "[type=password]" + n + ",";
                input += "[type=email]" + n + ",";
                input += "[type=url]" + n + ",";
                input += "[type=number]" + n + ",";
                input += "[type=hidden]" + n + ",";
                input += "[type=search]" + n;
                //==========================
                // INPUT VALUE
                //==========================
                $elem.find(input).val(v);
                //==========================
                // CHECKBOX
                //==========================
                //if (v === "1") {
                $elem.find("[type=checkbox]" + n).prop("checked", "checked");
                //}
                //==========================
                // CHILD ELEMENTS
                //==========================
                $elem.find("[ff-child]" + n).each(function (i) {
                    var child = $(this).attr("ff-child");
                    $(child).show();
                });
                //==========================
                // RELATIVE NAME
                //==========================
                $elem.find("[ff-name]" + n).each(function (i) {
                    var name = $(this).attr("ff-name");
                });
                // bug fix = materializecss labels update
                /*$elem.find(input).each(function (i, element) {
                 if ($(element).val().length > 0) {
                 $(this).siblings("label, i").addClass("active");
                 }
                 });*/
            } // not null
        }); // each
    } // for
}

//============================
// GLOBAL FUNCTIONS
//============================
function setMask() {
    $('.money').mask('000.000.000.000.000,00', {reverse: true});
    $('.phone').mask('(00) 00000-0000');
    $('.zipcode').mask('00000-000');
}

// NOTIFY
function notify(text, type) {
    if (typeof type === "undefined") {
        type = "error";
    }
    var n = new Noty({
        text: text,
        type: type, // success, error, warning, information, notification
        theme: 'sunset', // mint, sunset, relax, metroui, bootstrap-v3, bootstrap-v4, nest, semanticui
        layout: 'center',
        timeout: 1500
    });
    //console.log(n); // Returns a NOTY javascript object
    n.show();
}
//==============================================
// SET PRETTY DATE = REQUER prettydate.js
//==============================================
function pretty() {
    $(".prettydate").prettydate({
        beforeSuffix: "atrás",
        messages: {
            second: "Agora mesmo",
            seconds: "%s segundos %s",
            minute: "Um minuto %s",
            minutes: "%s minutos %s",
            hour: "Uma hora %s",
            hours: "%s horas %s",
            day: "Um dia %s",
            days: "%s dias %s",
            week: "Uma semana %s",
            weeks: "%s semanas %s",
            month: "Um mês %s",
            months: "%s meses %s",
            year: "Um ano %s",
            years: "%s anos %s",
            // Extra
            yesterday: "Ontem",
            beforeYesterday: "Antes de ontem",
            tomorrow: "Amanhã",
            afterTomorrow: "Depois de amanhã"

        }
    });
}

//============================
// ERROR
//============================
function errorCheck(err) {
    //alert(err);
    // DADOS INVALIDOS
    if (err == "1") {
        //
        localStorage.removeItem("user_id");
        localStorage.removeItem("user_email");
        localStorage.removeItem("user_pass");
        //
        myApp.alert("Desculpe, suas credenciais estão inválidas.", "Erro", function () {
            window.location.href = "index.html";
        });
    }
    // NÃO TEM USER_NAME (APENAS FACEBOOK)
    else if (err == "2") {
        if (sessionStorage.activePage != "user_name") {
            go("user_name.html");
        }
    }
    // OUTRO ERRO
    else {
        myApp.alert('Desculpe, ocorreu um erro no lado do servidor. #' + err, 'Erro');
    }
}

//============================
// AJAX CALLBACKS
//============================
$(function () {
    $.ajaxSetup({
        error: function (jqXHR, exception) {
            if (jqXHR.status === 0) {
                notify('Not connect. Verify Network.');
            } else if (jqXHR.status == 404) {
                notify('Requested page not found. [404]');
            } else if (jqXHR.status == 500) {
                notify('Internal Server Error [500].');
            } else if (exception === 'parsererror') {
                notify('Requested JSON parse failed.');
            } else if (exception === 'timeout') {
                notify('Time out error.');
            } else if (exception === 'abort') {
                notify('Ajax request aborted.');
            } else {
                notify('Uncaught Error.\n' + jqXHR.responseText);
            }
        }
    });
});
