/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

const ui = __webpack_require__(1);
(function (global, factory) {
     true ? factory(__webpack_require__(6)) :
    typeof define === 'function' && define.amd ? define(['@bhmb/bot'], factory) :
    (factory(global['@bhmb/bot']));
}(this, (function (bot) { 'use strict';
    const MessageBot = bot.MessageBot;

    MessageBot.registerExtension("DaPersonMGN/CombatMessages", function(ex, world) {
      //Debugging purposes.
      //window.ex2 = ex;
      ex.messages = { pvp: [], death: []};
      ex.players = {};


      ex.remove = function() {
        if (!ex.bot.getExports("ui")) {return}
        var ui = ex.bot.getExports("ui");
        ui.removeTab(ex.pvpTab);
        ui.removeTab(ex.deathTab);
      };
      ex.uninstall = function(){
        ex.storage.clear("messages");
        ex.remove();
      }; //for now.

      ex.save = function() {
        ex.storage.set("messages",ex.messages);
      };

      ex.load = function() {
        ex.messages = ex.storage.get("messages",{
          pvp: [],
          death: []
        });
      };

      ex.playerInit = function(playerName) {
        if (!ex.players[playerName]) {
          ex.players[playerName] = {
            pvp: {
              attack: {
                staff: 0,
                mod: 0,
                anyone: 0,
                admin: 0,
                owner: 0
              },
              attacked: {
                staff: 0,
                mod: 0,
                anyone: 0,
                admin: 0,
                owner: 0
              }
            },
            death: 0
          };
        }
      };

      ex.playerHit = function(victim, attacker) {
        ex.playerInit(victim);
        ex.playerInit(attacker);
        var player = world.getPlayer(victim);
        if (player.isMod) {
          ex.players[attacker].pvp.attack.mod++;
        }
        if (player.isAdmin) {
          ex.players[attacker].pvp.attack.admin++;
        }
        if (player.isStaff) {
          ex.players[attacker].pvp.attack.staff++;
        }
        if (player.isOwner) {
          ex.players[attacker].pvp.attack.owner++;
        }
        ex.players[attacker].pvp.attack.anyone++;

        player = world.getPlayer(attacker);
        if (player.isMod) {
          ex.players[victim].pvp.attacked.mod++;
        }
        if (player.isAdmin) {
          ex.players[victim].pvp.attacked.admin++;
        }
        if (player.isStaff) {
          ex.players[victim].pvp.attacked.staff++;
        }
        if (player.isOwner) {
          ex.players[victim].pvp.attacked.owner++;
        }
        ex.players[victim].pvp.attacked.anyone++;
      };

      ex.playerDeath = function(victim) {
        ex.playerInit(victim);
        ex.players[victim].death++;
      };

      ex.evaluateMessage = function(msg) {
        if (msg.indexOf(" was harmed by player ") > -1) {
          //pvp
          var bhName = msg.substring("Blockhead named".length+1,msg.indexOf(" owned by player "));
          var victim = msg.substring(msg.indexOf(" owned by player ")+" owned by player".length+1, msg.indexOf(" was harmed by player "));
          var attacker = msg.substring(msg.indexOf(" was harmed by player ")+"was harmed by player".length+2,msg.length-1);
          return ["pvp", bhName, victim, attacker];
        } else if (msg.indexOf("Blockhead died named ") === 0){
          //death
          var bhName = msg.substring("Blockhead died named".length+1,msg.indexOf(" owned by player "));
          var victim = msg.substring(msg.indexOf(" owned by player")+" owned by player ".length,msg.length-1);
          return ["death", bhName, victim];
        } else {
          return ["fail"];
        }
      };

      ex.messageHandler = function(msg) {
        var parsedMsg = ex.evaluateMessage(msg);
        if (parsedMsg[0] === "pvp") {
          var victim = parsedMsg[2];
          var attacker = parsedMsg[3];
          ex.playerHit(victim, attacker);
          for (var pvpMsg of ex.messages.pvp) {
            var targetGroup = pvpMsg.attacker;
            if (Number(pvpMsg.min) < ex.players[victim].pvp.attacked[targetGroup] && Number(pvpMsg.max) > ex.players[victim].pvp.attacked[targetGroup]) {
              if (targetGroup !== "anyone") {
                var attackerP = world.getPlayer(attacker);
                if (attackerP["is"+targetGroup.substring(0,1).toUpperCase()+targetGroup.substring(1)]) {
                  var victimP = world.getPlayer(victim);
                  if (pvpMsg.victim !== "anyone") {
                    if (victimP["is"+pvpMsg.victim.substring(0,1).toUpperCase()+pvpMsg.victim.substring(1)]) {
                      //send
                      ex.bot.send(pvpMsg.msg.replace(/{{VICTIM}}/gi,victim).replace(/{{BHVICTIM}}/gi,parsedMsg[1]).replace(/{{ATTACKER}}/gi,attacker));
                    }
                  } else {
                    //send
                    ex.bot.send(pvpMsg.msg.replace(/{{VICTIM}}/gi,victim).replace(/{{BHVICTIM}}/gi,parsedMsg[1]).replace(/{{ATTACKER}}/gi,attacker));
                  }
                }
              } else {
                var victimP = world.getPlayer(victim);
                if (pvpMsg.victim !== "anyone") {
                  if (victimP["is"+pvpMsg.victim.substring(0,1).toUpperCase()+pvpMsg.victim.substring(1)]) {
                    //send
                    ex.bot.send(pvpMsg.msg.replace(/{{VICTIM}}/gi,victim).replace(/{{BHVICTIM}}/gi,parsedMsg[1]).replace(/{{ATTACKER}}/gi,attacker));
                  }
                } else {
                  //send
                  ex.bot.send(pvpMsg.msg.replace(/{{VICTIM}}/gi,victim).replace(/{{BHVICTIM}}/gi,parsedMsg[1]).replace(/{{ATTACKER}}/gi,attacker));
                }
              }
            }
          }
        } else if (parsedMsg[0] === "death") {
          var victim = parsedMsg[2];
          ex.playerDeath(victim);
          for (var deathMsg of ex.messages.death) {
            if (Number(deathMsg.min) < ex.players[victim].death && Number(deathMsg.max) > ex.players[victim].death) {
              var targetGroup = deathMsg.victim;
              if (targetGroup !== "anyone") {
                if (world.getPlayer(victim)["is"+deathMsg.victim.substring(0,1).toUpperCase()+deathMsg.victim.substring(1)]) {
                  //send
                  ex.bot.send(deathMsg.msg.replace(/{{BHVICTIM}}/gi,parsedMsg[1]).replace(/{{VICTIM}}/gi,victim));
                }
              } else {
                //send
                ex.bot.send(deathMsg.msg.replace(/{{BHVICTIM}}/gi,parsedMsg[1]).replace(/{{VICTIM}}/gi,victim));
              }
            }
          }
        }
      };

      ex.world.getLogs(true).then(function(logs){
        for (var log of logs) {
          var parsedMsg = ex.evaluateMessage(log.message);
          if (parsedMsg[0] !== "fail") {
            var attacker;
            var victim;
            var player;
            if (parsedMsg[0] === "pvp") {
              //pvp
              victim = parsedMsg[2];
              attacker = parsedMsg[3];
              ex.playerHit(victim, attacker);
            } else {
              //death
              victim = parsedMsg[2];
              ex.playerDeath(victim);
            }

          }
        }
      });
      world.onOther.sub(ex.messageHandler);
      ex.load();
      if (!ex.bot.getExports("ui")) {return} //NO UI 4 U. >:C
      ui(ex);
    });

})));


//Blockhead named CODY owned by player DAPPERCOW was harmed by player NANOBERRIES.
//Blockhead died named CODY owned by player DAPPERCOW.


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

const pvpTab = __webpack_require__(2);
const pvpMessageTemplate = __webpack_require__(3);
const deathTab = __webpack_require__(4);
const deathMessageTemplate = __webpack_require__(5);

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


/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = "<!--Copied from Bibliophile's messages extension. The only changes are text. Mainly because I feel all the message tabs should look alike for a happier user experience.-->\r\n<div class=\"container is-fluid\">\r\n  <section class=\"section is-small\">\r\n    <span class=\"button is-primary is-pulled-right\">+</span>\r\n    <h3 class=\"title is-4\">These are sent whenever someone get's hit.</h3>\r\n    <span>You can use {{ATTACKER}}, {{BHVICTIM}}, and {{VICTIM}} in your messages.</span>\r\n  </section>\r\n  <div class=\"columns is-multiline\" style=\"border-top: 1px solid #000\">\r\n\r\n  </div>\r\n</div>\r\n"

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = "<template>\r\n  <div class=\"column is-4-desktop is-6-tablet\">\r\n    <div class=\"box\">\r\n\r\n      <label>\r\n        Message\r\n        <input class=\"input\" data-input=\"message\" />\r\n      </label><br />\r\n\r\n      <label>\r\n        Activated when attacked between\r\n        <input class=\"input\" data-input=\"min\" type=\"number\" />\r\n      </label><br />\r\n\r\n      <label>\r\n        and\r\n        <input class=\"input\" data-input=\"max\" type=\"number\" />\r\n      </label><br />\r\n      <details>\r\n        <summary>More options</summary>\r\n        <label>Attacked by\r\n          <select data-input=\"attacker\">\r\n            <option value=\"anyone\">anyone</option>\r\n            <option value=\"staff\">a staff</option>\r\n            <option value=\"mod\">a moderator</option>\r\n            <option value=\"admin\">a administrator</option>\r\n            <option value=\"owner\">the owner</option>\r\n          </select>\r\n        </label>\r\n        <br />\r\n        <label>Victim is\r\n          <select data-input=\"victim\">\r\n            <option value=\"anyone\">anyone</option>\r\n            <option value=\"staff\">a staff</option>\r\n            <option value=\"mod\">a moderator</option>\r\n            <option value=\"admin\">a administrator</option>\r\n            <option value=\"owner\">the owner</option>\r\n          </select>\r\n        </label>\r\n      </details>\r\n      <a>Delete</a>\r\n    </div>\r\n  </div>\r\n</template>\r\n"

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = "<!--Copied from Bibliophile's messages extension. The only changes are text. Mainly because I feel all the message tabs should look alike for a happier user experience.-->\r\n<div class=\"container is-fluid\">\r\n  <section class=\"section is-small\">\r\n    <span class=\"button is-primary is-pulled-right\">+</span>\r\n    <h3 class=\"title is-4\">These are sent whenever someone dies.</h3>\r\n    <span>You can use {{BHVICTIM}} and {{VICTIM}} in your messages.</span>\r\n  </section>\r\n  <div class=\"columns is-multiline\" style=\"border-top: 1px solid #000\">\r\n\r\n  </div>\r\n</div>\r\n"

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = "<template>\r\n  <div class=\"column is-4-desktop is-6-tablet\">\r\n    <div class=\"box\">\r\n\r\n      <label>\r\n        Message\r\n        <input class=\"input\" data-input=\"message\" />\r\n      </label><br />\r\n\r\n      <label>\r\n        Activated when player dies between\r\n        <input class=\"input\" data-input=\"min\" type=\"number\" />\r\n      </label><br />\r\n\r\n      <label>\r\n        and\r\n        <input class=\"input\" data-input=\"max\" type=\"number\" />\r\n      </label><br />\r\n      <details>\r\n        <summary>More options</summary>\r\n        <label>Victim is\r\n          <select data-input=\"victim\">\r\n            <option value=\"anyone\">anyone</option>\r\n            <option value=\"mod\">a moderator</option>\r\n            <option value=\"admin\">a administrator</option>\r\n            <option value=\"owner\">the owner</option>\r\n          </select>\r\n        </label>\r\n      </details>\r\n      <a>Delete</a>\r\n    </div>\r\n  </div>\r\n</template>\r\n"

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = window['@bhmb/bot'];

/***/ })
/******/ ]);
