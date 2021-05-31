const Post = require("../../models/User/Post");
const hashtagSchema = require("../../models/User/hashtags");
// create post by admin
exports.create_postNew = async (req, res, next) => {
    try {
      const { text, url, body, thumbnail, place, type, user_id } = req.body;
      // string.match(/#\w+/g)
      var arr_hash = body.match(/(^|\s)#(\w+)/g);
      console.log(arr_hash);
      var hash_tag = [];
      if (arr_hash) {
        console.log(arr_hash);
        arr_hash = arr_hash.map(function (v) {
          return v.trim().substring(1);
        });
        hash_tag.push(...arr_hash);
        const get_hashtag = await hashtagSchema.distinct("hashtag", {
          hashtag: arr_hash,
        });
        console.log(get_hashtag);
        hash_tags = new Set(get_hashtag.map((tag) => tag));
   
        arr_hash = arr_hash.filter((id) => !hash_tags.has(id));
   
        console.log(arr_hash);
   
        arr_hash.forEach(async (element) => {
          const hashtag = new hashtagSchema({
            hashtag: element,
            created_at: new Date(),
          }).save();
        });
      }
      if (type == 1 || type == 2 || type == 3)
        update_postwithType(
          user_id,
          url,
          "",
          thumbnail,
          body,
          place,
          type,
          hash_tag,
          res
        );
      if (type == 4)
        update_postwithType(
          user_id,
          "",
          text,
          thumbnail,
          body,
          place,
          type,
          hash_tag,
          res
        );
    } catch (error) {
      return res.json({
        success: false,
        message: "Error adding post" + error,
      });
    }
  };
   
  async function update_postwithType(
    userId,
    url,
    text,
    thumbnail,
    body,
    place,
    type,
    hashtag,
    res
  ) {
    try {
      var createdPost = await new Post({
        user_id: userId,
        url: url,
        text_content: text,
        thumbnail: thumbnail,
        body: body,
        place: place,
        post_type: type,
        hastag: hashtag,
        isActive: true,
        created_at: Date.now(),
      }).save();
      return res.json({
        success: true,
        message: createdPost,
      });
    } catch (error) {
      return res.json({
        success: false,
        message: "Error adding post" + error,
      });
    }
  }

exports.getAllPost = async(req,res,next)=>{

    try
    {
        const getPosts = await Post.find({}).sort({created_at: -1}).populate('user_id','username isActive').exec();
        if(getPosts.length>0)
        {
            return res.json({
                success: true,
                result: getPosts,
                message: "Fetched posts successfully"
              }); 
        }
        else
        {
            return res.json({
                success: false,
                message: "No data found"
              });
        }
    }
    catch(error)
    {
        return res.json({
            success: false,
            message: "Error occured!" + error,
          });
    }
}

exports.getPostDetail = async(req,res,next)=>{

    try 
    {
       const getPost = await Post.findOne({_id:req.query.post_id}).populate('user_id','username first_name last_name avatar email country_code created_At').exec();
        if(getPost)
        {
            return res.json({
                success: true,
                result: getPost,
                message: "Fetched posts successfully"
              }); 
        }
        else
        {
            return res.json({
                success: false,
                message: "No data found"
              });
        }
    } 
    catch (error) {
        return res.json({
            success: false,
            message: "Error occured!" + error,
          });
    }
}