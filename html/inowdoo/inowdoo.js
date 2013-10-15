// TODO: Add date handling 
  
function TimesheetCtrl($scope){ 
  $scope.date = new Date(); 
  $scope.tasks = new Array(); 
  
  $scope.addTask = function() { 
    if($scope.taskText.trim().length = 0) 
        return; 
  
    var inputObject = analyzeInput($scope.taskText, $scope.date, $scope.tasks); 
  
    if(inputObject.isCreateOperation()){ 
      $scope.tasks.push({text:inputObject.inputText, start:inputObject.displayDate}); 
  
    }else if(inputObject.isUpdateOperation()){ 
      $scope.tasks[inputObject.matchedRow].start = inputObject.displayDate; 
      $scope.tasks[inputObject.matchedRow].text = inputObject.followingDate; 
  
    }else if(inputObject.isDeleteOperation()){ 
      $scope.tasks.splice(inputObject.matchedRow, 1); 
  
    }else if(inputObject.isMoveOperation()){ 
      $scope.tasks[inputObject.matchedRow].start = inputObject.moveToDate; 
  
    }else if(inputObject.isDateOperation()){ 
      $scope.date = inputObject.inputDate; 
  
    } 
  
    $scope.recalculate(); 
    $scope.taskText = ''; 
  }; 
  
  $scope.recalculate = function(){ 
    for(i=0;i<$scope.tasks.length;i++){ 
      var itemI = $scope.tasks[i]; 
      itemI.stop = null; 
      itemI.duration = null; 
  
      // Calculate .stop 
      for(j=0;j<$scope.tasks.length;j++){ 
        var itemJ = $scope.tasks[j]; 
        if(itemI.start.getTime() < itemJ.start.getTime() && (itemI.stop == null || itemJ.start.getTime() < itemI.stop.getTime())) 
          itemI.stop = itemJ.start; 
      } 
  
      // Calculate .duration 
      if(itemI.stop != null){ 
        var duration = new Date(itemI.stop - itemI.start); 
        itemI.duration = (duration.getUTCHours() + duration.getUTCMinutes() / 60).toFixed(2); 
      } 
    } 
  }; 
  
  $scope.taskCurr = function(index){ 
    return index == $scope.tasks.length-1; 
  }; 
} 
  
function analyzeInput(text, date, rows){ 
  var inputObject = new InputObject(text, date); 
  
  var timeFound = inputObject.parseTime(); 
  var dateFound = inputObject.parseDate(); 
  
  if(dateFound != null){ 
    inputObject.inputDate = dateFound; 
  }else if(timeFound != null){ 
    inputObject.displayDate = timeFound; 
    inputObject.inputText = inputObject.removeTime(inputObject.inputText); 
  
    timeFound = inputObject.parseTime(); 
    if(timeFound != null){ 
      inputObject.moveToDate = timeFound; 
      inputObject.inputText = inputObject.removeTime(inputObject.inputText); 
    } 
  
    for(i=0;i<rows.length;i++){ 
      if(rows[i].start.getHours() == inputObject.displayDate.getHours() && rows[i].start.getMinutes() == inputObject.displayDate.getMinutes()){ 
        inputObject.matchedRow = i; 
        break; 
      } 
    } 
  } 
  
  return inputObject; 
} 
  
function InputObject(inputText, displayDate) { 
  this.inputText = inputText; 
  this.displayDate = displayDate; 
  this.inputDate = null; 
  this.moveToDate = null; 
  this.matchedRow = -1; 
  
  this.parseTime = function(){ 
    var time = this.inputText.match(new RegExp('\\d?\\d:\\d\\d')); 
    if(time != null && time.length > 0) 
      return this.timeStrToDate(time[0]); 
    return null; 
  } 
  
  this.parseDate = function(){ 
    var date = this.inputText.match(new RegExp('\\d?\\d\\.\\d?\\d\\.\\d?\\d?\\d\\d')); 
    if(date != null && date.length > 0) 
      return this.dateStrToDate(date[0]); 
    return null; 
  } 
  
  this.timeStrToDate = function(timeArray){ 
    var time = timeArray.split(':'); 
    return  new Date(this.displayDate.getFullYear(), this.displayDate.getMonth() ,this.displayDate.getDate(), time[0], time[1], 0); 
  } 
  
  this.dateStrToDate = function(timeArray){ 
    var date = timeArray.split('.'); 
    return  new Date(date[0], date[1] ,date[2], 0, 0, 0); 
  } 
  
  this.removeTime = function(str){ 
    return str.substring(str.indexOf(':') +3).trim(); 
  } 
  
  this.isCreateOperation = function(){ 
    return this.matchedRow == -1; 
  } 
  
  this.isUpdateOperation = function(){ 
      return this.matchedRow > -1 && this.moveToDate == null && this.inputText.indexOf('-') != 0 && this.inputText.length > 0; 
  } 
  
  this.isDeleteOperation = function(){ 
      return this.matchedRow > -1 && this.inputText.indexOf('-') == 0 && this.inputText.length == 1; 
  } 
  
  this.isMoveOperation = function(){ 
    return this.moveToDate != null; 
  } 
  
  this.isDateOperation = function(){ 
    return this.inputDate != null; 
  } 
}
