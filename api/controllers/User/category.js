const Category = require("../../models/User/category");

exports.createCategory = async(req,res,next)=>{

    try 
    {
        let category = req.body.category;
        const data = new Category({category:category});
        const saveData = await data.save();
        console.log(saveData);
        if(saveData)
        {
            return res.json({
                success: true,
                message: "Category created successfully"
              });
        } 
    } 
    catch (error) {
        return res.json({
            success: false,
            message: "Error adding Comment" + error,
          });
    }
}

exports.fetchCategory = async(req,res,next)=>{

    try
    {
       const getAllcategory = await Category.find({}).exec();
       if(getAllcategory)
       {
           return res.json({
               success : true,
               result : getAllcategory,
               message : "Category fetched successfully"
           })
       }
    } 
    catch (error) {
        return res.json({
            success: false,
            message: "Error adding Comment" + error,
          });
    }
}