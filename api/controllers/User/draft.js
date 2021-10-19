const draft = require("../../models/User/draft");


//savePostToDraft
exports.savePostToDraft = async(req,res,next)=>{

    const user_id = req.user_id;
    const { text, url, body, thumbnail, type, privacyType, tagged_userId, category,comment_option,download_option } = req.body;
    let Poll = [] = req.body.Poll;
    let pollDuration = req.body.pollDuration;

    if (type == 1 || type == 2 || type == 3 || type == 5)
      update_draftpostwithType(
        user_id,
        url,
        "",
        [],
        "",
        thumbnail,
        body,
        type,
        privacyType,
        tagged_userId,
        category,
        comment_option,
        download_option,
        res
      );
  if (type == 4)
    update_draftpostwithType(
        user_id,
        "",
        text,
        [],
        "",
        thumbnail,
        body,
        type,
        privacyType,
        tagged_userId,
        category,
        comment_option,
        download_option,
        res
      );
  if (type == 6)
    update_draftpostwithType(
        user_id,
        "",
        text,
        Poll,
        pollDuration,
        thumbnail,
        body,
        type,
        privacyType,
        tagged_userId,
        category,
        comment_option,
        download_option,
        res
      );

}

async function update_draftpostwithType(
    userId,
    url,
    text,
    Poll,
    pollDuration,
    thumbnail,
    body,
    type,
    privacyType,
    tagged_userId,
    category,
    comment_option,
    download_option,
    res
  ) {
    try {
      const createdDraftPost = await new draft({
        user_id: userId,
        url: url,
        text_content: text,
        Poll: Poll,
        pollDuration: pollDuration,
        thumbnail: thumbnail,
        body: body,
        post_type: type,
        privacyType: privacyType,
        tagged_userId: tagged_userId,
        category: category,
        comment_option: comment_option,
        download_option: download_option,
        created_at: Date.now(),
      }).save();
  
      if(createdDraftPost) 
      {
        return res.json({
            success: true,
            result: createdDraftPost,
            message: "loop added to Draft successfully"
          });
  
      }
      else 
      {
        return res.json({
          success: false,
          message: "Error adding loop to draft" + error,
        });
      }
  
    } catch (error) {
      return res.json({
        success: false,
        message: "Error adding loop to draft" + error,
    });
    }
  }

//editDraftPost
exports.editDraftPost = async(req,res,next)=>{

    const { draft_id, text, url, body, thumbnail, type, privacyType, tagged_userId, category,comment_option,download_option } = req.body;
    let Poll = [] = req.body.Poll;
    let pollDuration = req.body.pollDuration;

    if (type == 1 || type == 2 || type == 3 || type == 5)
      edit_draftpostwithType(
        draft_id,
        url,
        "",
        [],
        "",
        thumbnail,
        body,
        type,
        privacyType,
        tagged_userId,
        category,
        comment_option,
        download_option,
        res
      );
    if (type == 4)
    edit_draftpostwithType(
        draft_id,
        "",
        text,
        [],
        "",
        thumbnail,
        body,
        type,
        privacyType,
        tagged_userId,
        category,
        comment_option,
        download_option,
        res
      );
    if (type == 6)
      edit_draftpostwithType(
          draft_id,
          "",
          text,
          Poll,
          pollDuration,
          thumbnail,
          body,
          type,
          privacyType,
          tagged_userId,
          category,
          comment_option,
          download_option,
          res
        );

}

async function edit_draftpostwithType(
    draft_id,
    url,
    text,
    Poll,
    pollDuration,
    thumbnail,
    body,
    type,
    privacyType,
    tagged_userId,
    category,
    comment_option,
    download_option,
    res
) {

  try
  {
      const editedDraft = await draft.findOneAndUpdate(
        {_id: draft_id},
        {
          $set: {
            url : url,
            text : text,
            Poll : Poll,
            pollDuration : pollDuration,
            thumbnail : thumbnail,
            body : body,
            post_type: type,
            privacyType: privacyType,
            tagged_userId: tagged_userId,
            category: category,
            comment_option: comment_option,
            download_option: download_option
          }
        },{new : true}
      );

      if(editedDraft)
      {
        return res.json({
          success: true,
          result: editedDraft,
          message: "Successfully edited draft post"
        });
      }
      else if(error)
      {
        return res.json({
          success: false,
          message: "Error editing loop to draft" + error
        });
      }
  }
  catch(error)
  {
      return res.json({
        success: false,
        message: "Error editing loop to draft" + error
      });
  }

}

//deleteDraftPost
exports.deleteDraftPost = async(req,res,next)=>{

    let draft_id = req.body.draft_id;

    const deleteDraftPost = await draft.findOneAndDelete({_id: draft_id});
    if(deleteDraftPost)
    {
        return res.json({
            success: true,
            message: "successfully deleted"
          });
    }
    else
    {
        return res.json({
            success: false,
            message: "Error occured"
        });
    }

}

//getDraftPosts
exports.getDraftPosts = async(req,res,next)=>{

    let user_id = req.user_id;

    const draftPosts = await draft.find({user_id: user_id}).populate("user_id","name username avatar private follow").exec();
    if(draftPosts.length)
    {
      return res.json({
        success: true,
        result : draftPosts,
        message: "Successfully fetched"
      });
    }
    else
    {
      return res.json({
        success: true,
        result : [],
        message: "No draft post"
      });
    }

}

