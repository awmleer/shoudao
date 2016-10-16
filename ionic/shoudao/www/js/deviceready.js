var contacts_service;

document.addEventListener("deviceready", onDeviceReady, false);
// device APIs are available

function onDeviceReady() {
    contacts_service.get_contacts();
}