export function nl2br(str, is_xhtml) {
   if (typeof str === "undefined" || str === null) {
      return "";
   }

   var breakTag = is_xhtml || typeof is_xhtml === "undefined" ? "<br />" : "<br>";
   return (str + "").replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, "$1" + breakTag + "$2");
}


export function script_type2string(type) {
   if (type === "WEB_EVENT") {
      return "Web-event script";
   }
   if (type === "BUS_EVENT") {
      return "Bus-event script";
   }
   if (type === "DRIVER") {
      return "Driver script";
   }
   if (type === "TIMER_EVENT") {
      return "Timer-event script";
   }
   if (type === "SHEDULE_EVENT") {
      return "Shedule-event script";
   }
}
