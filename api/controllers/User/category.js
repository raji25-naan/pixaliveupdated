const Category = require("../../models/User/category");
const nodemailer = require("nodemailer");
const sleep = require('sleep-promise');
const postSchema = require('../../models/User/Post');
const Users = require("../../models/User/Users");

exports.createCategory = async(req,res,next)=>{

    let totalCategory = [
        // {category: "Accounting",image: ""},
        // {category: "Adventure",image: ""},
        // {category: "Aeronautics",image: ""},
        // {category: "Agriculture",image: ""},
        // {category: "Archeology",image: ""},
        // {category: "Architecture and Design",image: ""},
        // {category: "Artificial Intelligence",image: ""},
        // {category: "Astronomy",image: ""},
        // {category: "Automobiles",image: ""},
        // {category: "Actor",image: ""},
        // {category: "Actress",image: ""},
        // {category: "Books",image: ""},
        // {category: "Business",image: ""},
        // {category: "Cryptocurrency",image: ""},
        // {category: "Cyber security",image: ""},
        // {category: "Celebrity",image: ""},
        // {category: "Data science",image: ""},
        // {category: "Electronics",image: ""},
        // {category: "Enterpreneurship",image: ""},
        // {category: "Fashion",image: ""},
        // {category: "Finance",image: ""},
        // {category: "Fitness",image: ""},
        // {category: "Food",image: ""},
        // {category: "Freelance",image: ""},
        // {category: "Gaming",image: ""},
        // {category: "Gardening",image: ""},
        // {category: "Health",image: ""},
        // {category: "History",image: ""},
        // {category: "Investing",image: ""},
        // {category: "Journalism",image: ""},
        // {category: "Languages",image: ""},
        // {category: "Law",image: ""},
        // {category: "Literature",image: ""},
        // {category: "Media",image: ""},
        // {category: "Medica Science",image: ""},
        // {category: "Nature",image: ""},
        // {category: "Philosophy",image: ""},
        // {category: "Photography",image: ""},
        // {category: "Programming",image: ""},
        // {category: "Psychology",image: ""},
        // {category: "Robotics",image: ""},
        // {category: "Sales and Marketing",image: ""},
        // {category: "Science",image: ""},
        // {category: "Space",image: ""},
        // {category: "Sports",image: ""},
        // {category: "Startups",image: ""},
        // {category: "Visual Design",image: ""},
        // {category: "Web Design and Devlopment",image: ""},
        // {category: "Writing",image: ""},
        // {category: "Official",image: ""}

    ];
    await Category.create(totalCategory);
}

// exports.createCategory = async (req, res, next) => {

        // let category = req.body;
        // let totalCategory = [
            // {category: "Love",image: " https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/category_icons%2FLove.svg?alt=media&token=0441f570-d2d0-475f-99c0-de65976d9537"},
            // {category: "Serials",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FSerials.svg?alt=media&token=5ae8ed0c-238b-4508-845d-db1eb6a6c62e"},
            // {category: "Status",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/category_icons%2FStatus.svg?alt=media&token=4f4f7189-dcbd-4502-afdb-db82ea972836"},
            // {category: "Challenges",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FChallenges.svg?alt=media&token=8a3ab704-b281-427e-bacd-3ea4abddd6db"},
            // {category: "Others",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Others.svg?alt=media&token=b66518f6-1bd2-46e9-891d-48ebb3cf3706"},
            // {category: "Dance",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FDance.svg?alt=media&token=950eb741-d928-491e-a492-91c492954800"},
            // {category: "Comedy",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FComedy.svg?alt=media&token=c92077ca-18e1-427c-96d1-075897e63e21"},
            // {category: "Politics",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FPolitics.svg?alt=media&token=7afd3a0e-6257-44e6-bb1f-31629d0666e8"},
            // {category: "News",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/News.svg?alt=media&token=d3dbd56d-639a-4613-a57d-81157b526226"},
            // {category: "Movie Shows",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FMovie%20Shows.svg?alt=media&token=009f9b6d-42b2-4dd6-8c68-c488b2197fa4"},
            // {category: "Music",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FMusic.svg?alt=media&token=d0a1bff9-3319-44a3-b76f-709989000acf"},
            // {category: "Health&Fitness",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FHealth%20%26%20Fitness.svg?alt=media&token=5cb5cc23-974c-40f9-86e6-1f9e98f0bd32"},
            // {category: "Fashion",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FFashion.svg?alt=media&token=26ba965b-ebbb-4099-adbc-ec142637a011"},
            // {category: "Education",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FEducation.svg?alt=media&token=70aa6313-3329-40b4-9bdf-f54d32ddbf90"},
            // {category: "Learning",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FLearning.svg?alt=media&token=fa82f07b-ab0d-4b37-9716-c3fc1c8d36b5"},
            // {category: "Cooking",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FCooking.svg?alt=media&token=1d7c1872-90fa-4926-bf00-c1107a2af52d"},
            // {category: "Travel",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FTravel.svg?alt=media&token=632b5516-b029-411a-a532-ebf78554f2a2"},
            // {category: "Technology",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FTechnology.svg?alt=media&token=a88faf59-e504-4cf4-b5a2-e582229a3048"},
            // {category: "Quotes",image: " https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/category_icons%2FQuotes.svg?alt=media&token=c753b604-dcb7-438a-af0e-9f96a332b564"},
            // {category: "Sport",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FSport.svg?alt=media&token=a9e86070-e65d-4a81-8b1a-12f69fb48974"},
            // {category: "Nature",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FNature.svg?alt=media&token=4c0ba3f7-0d29-479e-9240-ccc0eadebb2a"},
            // {category: "Arts & Crafts",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FArts%20%26%20Crafts.svg?alt=media&token=4b7c93cd-10a3-4f68-b389-23f8b383df4e"},
            // {category: "Lifestyle",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FLifestyle.svg?alt=media&token=36270002-9c72-464a-977b-79f4563103e1"},
            // {category: "Design",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FDesign.svg?alt=media&token=f7122df2-fc28-4986-8b8b-90318a8da9fd"},
            // {category: "Gaming",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FGaming.svg?alt=media&token=6a384302-d600-4041-a320-cefc39aed4c5"},
            // {category: "Food",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FFood.svg?alt=media&token=81f2c49d-64f2-40b4-86c9-94fb0bd0c96b"},
            // {category: "Troll",image: " https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/category_icons%2FTroll.svg?alt=media&token=7a39093b-8549-43e8-be6e-07189acb4259"},
            // {category: "Economic",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FEconomic.svg?alt=media&token=20e2e78c-c44d-4bf2-8a1b-cd962849b6a4"},
            // {category: "Science",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FScience.svg?alt=media&token=56642052-57e0-4507-8c35-e6e1886d5f0a"},
            // {category: "Vlog",image: " https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/category_icons%2FVlog.svg?alt=media&token=05fd6e46-ac3d-4405-b1a7-977cda9683fb"},
            // {category: "Poetry",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FPoetry.svg?alt=media&token=d9661378-0fa2-4add-9061-5ee250495677"},
            // {category: "Reviews",image: " https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/category_icons%2FReview.svg?alt=media&token=7d999dc5-8342-4b67-8930-23f3a89d5d88"},
            // {category: "Handcraft",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FHandcraft.svg?alt=media&token=65b58caf-bf79-4d92-81e0-4e4b80aff3ba"},
            // {category: "Social Issues",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FSocial%20%20Issues.svg?alt=media&token=95ae843c-def8-4bc6-9984-f7f4f22d6c45"},
            // {category: "Animals",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FAnimals.svg?alt=media&token=ddc97c8c-d9db-4b6b-b2a2-fb3674fdd87b"},
            // {category: "Devotion",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FDevotion.svg?alt=media&token=6e5b48d1-6b36-4ad0-a488-ad59b4919ca2"},
            // {category: "Automobiles",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FAutomobiles.svg?alt=media&token=5e4e9e96-c6b1-44c3-9c1d-ace7b77a27c9"},
            // {category: "Q&A",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FQ%26A.svg?alt=media&token=61d3002f-e235-41ee-8c86-bd1d3852567f"},  
            // {category: "Trending",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2Ftrending.svg?alt=media&token=098477bc-84bf-4c5f-a79d-8d2269af81bc"}
                            //  ];
//         const saveData = await Category.create(totalCategory);
//         if (saveData) {
//             return res.json({
//                 success: true,
//                 message: "Category created successfully"
//             });
//         }
// }


exports.fetchCategory = async (req, res, next) => {
    const getAllcategory = await Category.find({}).exec();

    var arr = [];
    var count = 0;
    
    if(req.query.explore == "true")
    {
        getAllcategory.forEach(async data => {
            const findPhoto = await postSchema.find({
                    category: data.category,
                    privacyType: { $nin: ["onlyMe","private"] },
                    isActive: true,
                    isDeleted: false,
                    groupPost: false
                });
            
            const userList = await Users.find({
                    category: data.category,
                    isActive: true
                });
            if(findPhoto.length || userList.length) 
            {
                arr.push({
                    "_id": data._id,
                    "category": data.category,
                    "image": data.image,
                    "count": findPhoto.length,
                    "userCount": userList.length
                })
            }
            count = count + 1;
            if(getAllcategory.length == count)
            {
                Response();
            }
        })

        //Response
        function Response()
        {
            let getTrending = Category.findOne({category:"Trending"}).exec();
            arr.push({
                "_id": getTrending._id,
                "category": getTrending.category,
                "image": getTrending.image,
                "count": 0,
                "userCount": 0
            })
        
            let categoryList = arr.sort((a, b) => parseFloat(b.count) - parseFloat(a.count));
            return res.json({
                success: true,
                category: categoryList,
                message: "Category fetched successfully"
            });
        }
        
    }
    else
    {
        getAllcategory.forEach(async data => {
            const findPhoto = await postSchema.find({
                    category: data.category,
                    privacyType: { $nin: ["onlyMe","private"] },
                    isActive: true,
                    isDeleted: false,
                    groupPost: false
                });
            
            const userList = await Users.find({
                    category: data.category,
                    isActive: true
                });
            if(findPhoto.length || userList.length) 
            {
                arr.push({
                    "_id": data._id,
                    "category": data.category,
                    "image": data.image,
                    "count": findPhoto.length,
                    "userCount": userList.length
                })
            }
            else
            {
                arr.push({
                    "_id": data._id,
                    "category": data.category,
                    "image": data.image,
                    "count": 0,
                    "userCount": 0
                })
            }
            count = count + 1;
            if(getAllcategory.length == count)
            {
                Response();
            }
        })

        //Response
        function Response()
        {
            return res.json({
                success: true,
                category: arr,
                message: "Category fetched successfully"
            });
        }
        
    }
   
}

//feedBack
module.exports.sendFeedback = async (req, res, next) => {

        const { username, user_id, text, media } = req.body;

        const output = `
    <p>You have a new feedback </p>
    <h3>User Feedback Details</h3>
    <ul>  
      <li>username: ${username}</li>
      <li>user_id: ${user_id}</li>
      <li>text: ${text}</li>
      <li>media: ${media}</li>
    </ul>
  `;

        // create reusable transporter object using the default SMTP transport
        // let transporter = nodemailer.createTransport({
        //     // host: 'mail.YOURDOMAIN.com',
        //     // port: 587,
        //     service: 'gmail',
        //     secure: false, // true for 465, false for other ports
        //     auth: {
        //         user: 'Pixalivetesting@gmail.com', // generated ethereal user
        //         pass: 'Welcome@123'  // generated ethereal password
        //     },
        //     tls: {
        //         rejectUnauthorized: false
        //     }
        // });

        // // setup email data with unicode symbols
        // let mailOptions = {
        //     from: 'Pixalivetesting@gmail.com', // sender address
        //     to: 'Pixalivetesting@gmail.com', // list of receivers
        //     subject: 'Users Feedback', // Subject line
        //     html: output,
        //     attachments: [
        //         { filename: 'profile_avatar/steps.png', path: './profile_avatar/steps.png' } // TODO: replace it with your own image
        //     ]
        // };

        // // send mail with defined transport object
        // transporter.sendMail(mailOptions, (error, info) => {
        //     if (error) {
        //         return console.log(error);
        //     } else {
        //     //console.log('Message sent: %s', info.messageId);
        //     return res.json({
        //         success : true,
        //         message : "Feedback sent successufly",
        //         info : info.messageId
        //     })
        // }
        // });
        return res.json({
            success: true,
            message: "Feedback sent successufly"
        })
}