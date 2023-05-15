/* eslint-disable prettier/prettier */

const SSMLRoute = require('./SSMLRoute');

module.exports=(app)=>{
	app.get('/',function(req,res){
		res.send({
			'message':'Our first endpoint'
		});
	});


	app.use('/GenerateSSML',SSMLRoute);

}
