const ui = require("./ui.js");
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('@bhmb/bot')) :
    typeof define === 'function' && define.amd ? define(['@bhmb/bot'], factory) :
    (factory(global['@bhmb/bot']));
}(this, (function (bot) { 'use strict';
    const MessageBot = bot.MessageBot;

    MessageBot.registerExtension("DaPersonMGN/PVPMessages", function(ex, world) {
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
