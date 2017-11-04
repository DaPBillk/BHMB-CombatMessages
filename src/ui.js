const pvpTab = require("./html/pvpTab.html");
const pvpMessageTemplate = require("./html/pvp.html");
const deathTab = require("./html/deathTab.html");
const deathMessageTemplate = require("./html/death.html");

module.exports = function(ex) {
  ex.loadUI = function() {
    for (var pvpMsg of ex.messages.pvp) {
      ex.addPVPMessage(pvpMsg.msg, pvpMsg.min, pvpMsg.max, pvpMsg.attacker, pvpMsg.victim, false);
    }
    for (var deathMsg of ex.messages.death) {
      ex.addDeathMessage(deathMsg.msg, deathMsg.min, deathMsg.max, deathMsg.victim, false);
    }
  };

  ex.rebuildMessages = function() {
    ex.messages = {
      pvp: [],
      death: []
    };
    var pvpMessages = ex.pvpTab.querySelectorAll(".column");
    var deathMessages = ex.deathTab.querySelectorAll(".column");
    for (var pvpMsg of pvpMessages) {
      ex.messages.pvp.push({
        msg: pvpMsg.querySelector("input[data-input='message']").value,
        min: pvpMsg.querySelector("input[data-input='min']").value,
        max: pvpMsg.querySelector("input[data-input='max']").value,
        attacker: pvpMsg.querySelector("select[data-input='attacker']").value,
        victim: pvpMsg.querySelector("select[data-input='victim']").value
      });
    }
    for (var deathMsg of deathMessages) {
      ex.messages.death.push({
        msg: deathMsg.querySelector("input[data-input='message']").value,
        min: deathMsg.querySelector("input[data-input='min']").value,
        max: deathMsg.querySelector("input[data-input='max']").value,
        victim: deathMsg.querySelector("select[data-input='victim']").value
      });
    }
    ex.save();
  };
  var ui = ex.bot.getExports("ui");
  ex.pvpTab = ui.addTab("PVP Messages", "messages");
  ex.deathTab = ui.addTab("Death Messages", "messages");

  ex.pvpTab.innerHTML = pvpMessageTemplate+pvpTab;
  ex.deathTab.innerHTML = deathMessageTemplate+deathTab;

  ex.pvpTab.querySelector(".is-pulled-right").addEventListener("click",function(){ex.addMessage(true);});
  ex.pvpTab.addEventListener("click", function(e){
    var el = e.target;
    if (el.tagName === "A") {
      ui.alert("Are you sure you want to delete this message?",[{text:"Delete", style:"is-danger"},"Cancel"],function(action){
        if (action === "Delete") {
          el.parentElement.parentElement.remove();
          ex.rebuildMessages();
        }
      });
    }
  });
  ex.pvpTab.addEventListener("change", ex.rebuildMessages);

  ex.deathTab.querySelector(".is-pulled-right").addEventListener("click",function(){ex.addMessage(false);});
  ex.deathTab.addEventListener("click", function(e){
    var el = e.target;
    if (el.tagName === "A") {
      ui.alert("Are you sure you want to delete this message?",[{text:"Delete", style:"is-danger"},"Cancel"],function(action){
        if (action === "Delete") {
          el.parentElement.parentElement.remove();
          ex.rebuildMessages();
        }
      });
    }
  });
  ex.deathTab.addEventListener("change", ex.rebuildMessages);

  ex.addMessage = function(pvp) {
    if (pvp) {
      ex.addPVPMessage();
    } else {
      ex.addDeathMessage();
    }
    ex.save();
  };

  ex.addPVPMessage = function(msg = "", min=0, max=9999, attacker="anyone",victim="anyone", saveMessage=true) {
    ui.buildTemplate(ex.pvpTab.querySelector("template"), ex.pvpTab.querySelector(".columns"),[
      {selector: "input[data-input='message']", value: msg},
      {selector: "input[data-input='min']", value: Number(min)},
      {selector: "input[data-input='max']", value: Number(max)},
      {selector: "select[data-input='attacker']", value: attacker},
      {selector: "select[data-input='victim']", value: victim}
    ]);
    if (!saveMessage) {return}
    ex.messages.pvp.push({
      msg: msg,
      min: min,
      max: max,
      attacker: attacker,
      victim: victim
    });
  };

  ex.addDeathMessage = function(msg = "", min=0, max=9999, victim="anyone", saveMessage=true) {
    ui.buildTemplate(ex.deathTab.querySelector("template"), ex.deathTab.querySelector(".columns"),[
      {selector: "input[data-input='message']", value: msg},
      {selector: "input[data-input='min']", value: Number(min)},
      {selector: "input[data-input='max']", value: Number(max)},
      {selector: "select[data-input='victim']", value: victim}
    ]);
    if (!saveMessage) {return}
    ex.messages.death.push({
      msg: msg,
      min: min,
      max: max,
      victim: victim
    });
  };
  ex.loadUI();
};
