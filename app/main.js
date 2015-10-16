var app = require('app'); // Module to control application life.
var BrowserWindow = require('browser-window'); // Module to create native browser window.
var ipc = require('ipc');
var mongoose = require('mongoose');

var db = mongoose.connection
mongoose.connect('mongodb://localhost/goalsdb');
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function(callback) {
});

var goalSchema = mongoose.Schema({
    title: String,
    desc: String,
    done: Boolean,
    startDate: String,
    endDate: Date
});

var Goal = mongoose.model('Goal', goalSchema);

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform != 'darwin') {
        app.quit();
    }
});
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 800
    });

    // and load the index.html of the app.
    mainWindow.loadUrl('file://' + __dirname + '/index.html');

    // Open the DevTools.
    mainWindow.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
});

ipc.on('*', function(event, arg) {
    Goal.find(function(err, goals){
        event.sender.send('getAllGoals', goals);
    });
});

ipc.on('createGoal', function(event, arg1, arg2, arg3, arg4, arg5){
    Goal.create({
        title: arg1,
        desc: arg2,
        done: arg3,
        startDate: arg4,
        endDate: arg5
    }, function(arg) {
        event.sender.send('reply');
    });

    Goal.find(function(err, goals) {
        event.sender.send('getAllGoals', goals)
    });
});

ipc.on('deleteGoal', function(event, arg) {
    Goal.where('id:'+arg).findOneAndRemove(function(err, goal) {
        goal.remove();
        Goal.find(function(err, goals) {
            event.sender.send('getAllGoals', goals);
        });

    });
});