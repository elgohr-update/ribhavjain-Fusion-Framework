(function ($, Configuration) {
	console.log("image previewer for " + Configuration.id);
	
	console.log("Updating tab " + Configuration.tab);
	  
	  if(Configuration.fileSize < 3000000){
		  if(Configuration.fileType === "image/jpeg" || Configuration.fileType === "image/jpg" || Configuration.fileType === "image/png"){
			  $(Configuration.tab).append(
					     "<img src='" + Configuration.url + "' width='400px'></img>"
					  );
		  }
		  else if (Configuration.fileType === "image/tiff"){
			  $(Configuration.tab).append(
					  "<embed width=400 height=300 "+
					    "src='" + Configuration.url + "' type='image/tiff'"+
					    " negative=yes>"
					  );
		  }
		  else{
			  $(Configuration.tab).append(
		     		     "<b>ERROR: Unrecognised image format.</b>"
		     		  );
		  }
	  }
	  else{
		  function onZoomitResponse(resp) {
		      if (resp.error) {
		          // e.g. the URL is malformed or the service is down
		    	  $(Configuration.tab).append(
		     		     "<b>Zoom.it ERROR: "+ resp.error + "</b>"
		     		  );
		          return;
		      }
		       
		      var content = resp.content;
		      
		      // Create a closure to keep the old document.write private 
		      (function () {
		    	  	var oldDW = document.write;
		    	  	document.write = function (s) {       
		    	  			document.getElementById(Configuration.tab.replace("#","")).innerHTML = s;
		    	  		}
		      		})();	       
		      
		      $(Configuration.tab).append(content.embedHtml.replace(/width=(auto|[0-9]+px)?/,"width=700px")
		    		  .replace(/height=(auto|[0-9]+px)?/,"height=400px"));		  
		  }
		  
		  $.ajax({
		      url: "http://api.zoom.it/v1/content/?url=" +
		      encodeURIComponent("http://"+Configuration.hostIp+":"+window.location.port+Configuration.url),
		      dataType: "jsonp",
		      success: onZoomitResponse
		  });
	  }
	  
	  console.log($(Configuration.tab))
	}(jQuery, Configuration));