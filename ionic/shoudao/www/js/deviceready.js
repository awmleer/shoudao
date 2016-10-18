var contacts_service;
var device_is_ready=false;

document.addEventListener("deviceready", onDeviceReady, false);
// device APIs are available

function onDeviceReady() {
    device_is_ready=true;
    contacts_service.get_contacts();
}