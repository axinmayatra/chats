Msgs = new Mongo.Collection('msgs');

if (Meteor.isClient) {

	Meteor.subscribe('users');
	Session.set("chatroom","public");
	Meteor.startup(function() {
		UserPresence.awayTime = 60000;
		UserPresence.awayOnWindowBlur = false;
		UserPresence.start();	
	});

	Template.chat.onRendered(function() {
	this.find('.msg-box')._uihooks = {
		insertElement: function(node, next) {
			$(node)
				.hide()
				.insertBefore(next)
				.fadeIn();
		},
		removeElement: function(node) {
			$(node).fadeOut(function() {
				$(this).remove();
			});
		}
	};
});
	Template.registerHelper('getUserStatus', function(userId) {
	if (userId) {
		var user = Meteor.users.findOne({_id: userId});
	} else {
		var user = Meteor.user();
	}
	return user && user.status;
	});
	Template.body.helpers({
	
	});

	Template.chat.helpers({
		name: function() {
			return Meteor.user().username;
		},
		msgs: function() {
			if(Session.get("chatroom")=="public")
				return Msgs.find({to:Session.get("chatroom")},{sort:{at: -1}});	
			else
				return Msgs.find({$or: [{by: Meteor.user().username,to:Session.get("chatroom")},{by: Session.get("chatroom"),to:Meteor.user().username}]},{sort:{at: -1}});
		}
	});

	Template.sidebar.helpers({
		users: function () {
			return Meteor.users.find({}, {sort: {username: 1}});
		}
	});

	Template.sidebar.events({
		'click .btn-logout': function () {
			Meteor.logout();
		},
		'click .user-name': function(e) {
			var input = $('.msg-input');
			var val = input.val();
		if (/[^\s]$/.test(val)) {
			val += ' ';
		}
		input.val(val + '@' + this.username + ' ');
		input.focus();
		},
		'dblclick .user-name':function(e) {
			$('.msg-input').val('');
			Session.set("chatroom",this.username);
		}
	});

	Template.chat.events({
		
	});
	Template.chatbox.helpers({
		foo: function () {
			var t = "hello"
			return t;
		}
	});

	Template.chatbox.events({
		'submit .msg': function (e) {
			e.preventDefault();
			var t = e.target.text.value;
			Msgs.insert({
				msg: t,
				at: new Date(),
				by: Meteor.user().username,
				to: Session.get("chatroom")
			});
			e.target.text.value = "";
		}
	});

	Template.newmsg.helpers({
		
	});

	Template.newmsg.events({
		'dblclick .msgdata': function () {
			Msgs.remove(this._id);
		}
	});

	Template.login.events({
		'submit .login-box': function (e) {
			e.preventDefault();
			var user = e.target.username.value;
			var pass = e.target.password.value;
			if(! user){
				console.log("Enter username");
				return;
			}
			if(! pass){
				console.log("Enter Pass");
				return;
			}
			Meteor.loginWithPassword(user,pass, function(error) {
				if(error){
					console.log(error.reason);
				}
				else{
					Session.set("chatroom","public");
				}
			});
		}
	});

	Template.join.events({
		'submit .join-box': function (e) {
			e.preventDefault();
			var user = e.target.username.value;
			var pass = e.target.password.value;
			var c = e.target.passwordr.value;

			if(! user){
				console.log("Enter username");
				return;
			}
			if(! pass){
				console.log("Enter Password");
				return;
			}
			if(pass!==c){
				console.log("Pass mismatch");
				return;
			}

			Accounts.createUser({
				username: user,
				password: pass
			}, function (error) {
				if(error){
					console.log("Error in joining");
				}
				// Presence.insert({
				// 	username: Meteor.user().username,
				// 	at: new Date()
				// });
			});

		}
	});

	Template.sidebar.events({
		
	});

	Accounts.ui.config({
		passwordSignupFields: 'USERNAME_ONLY'
	});
}
//End Of Client side code


if (Meteor.isServer) {
	Meteor.startup(function () {
		// code to run on server at startup
		
	});
	Meteor.publish('users', function() {
		return Meteor.users.find({}, {fields: {status: 1, statusDefault: 1, statusConnection: 1, username: 1}});
	});

	UserPresenceMonitor.start();
	UserPresence.activeLogs();
	UserPresence.start();
}
