
function formattedDate(d = new Date) {
    let month = String(d.getMonth() + 1);
    let day = String(d.getDate());
    const year = String(d.getFullYear());

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    var hour = d.getHours();


    return `${day}/${month}/${year} ${d.getHours()} : ${d.getMinutes()}`;
}

function display_messages() {

    if (!localStorage["msgList"])
        return ;

    var msgList = JSON.parse(localStorage["msgList"]);
    console.log(msgList);

    var latestMsgList = [...msgList].reverse();
    var itemResults = "";
    for (let i = 0; i < latestMsgList.length; i++) {
        let item = latestMsgList[i];

        var itemResult = `<tr> <td> ${item.log_time} </td> <td> ${item.log_msg} </td></tr>`;

        itemResults += itemResult;
    }

    if (itemResults != "")
        var _rows = document.querySelector("#table_msg").rows[0].innerHTML;

    _rows += itemResults
    document.querySelector("#table_msg").innerHTML = _rows;

}

var initServiceWorker = () =>{
    navigator.serviceWorker.register('service-worker.js')
        .then(() => {
            console.log('Registered Service Worker');
            //subscribePushNotification(); //taken away in ex. 3 to subscribe on click of button

        })
        .catch(error => {
            console.log("Registering of Service Worker Failed: " + error);
        });

}

var indexPage = () => {

    
    // update table
    display_messages();

    document.querySelector("#btn_record").onclick = () => {
        if (window.localStorage) {

            var msgList = []

            if(localStorage["msgList"])
                msgList = JSON.parse(localStorage["msgList"]);

            var log_time = formattedDate();

            var log_msg = document.getElementById("ta_message").value;
            var newMsgDetail = { "log_time": log_time, "log_msg": log_msg };

            msgList.push(newMsgDetail);

            localStorage["msgList"] = JSON.stringify(msgList);


            // update table
            display_messages();
        }

    }
}
