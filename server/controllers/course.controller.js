import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import {deleteMediaFromCloudinary, deleteVideoFromCloudinary, uploadMedia} from "../utils/cloudinary.js"
export const createCourse = async (req,res)=> {
    try{
      const {courseTitle ,category} = req.body;

      if(!courseTitle || !category){
          return res.status(400).json({
             message:"Course title and category are required",
             success: false
          })
      }

      //create course
      const course = await Course.create({
         courseTitle,
         category,
         creator: req.id
      });

      return res.status(201).json({
         course,
         message:"Course created successfully",
         success:true
      })

    } catch(error){
      console.log(error);
      return res.status(500).json({
         message:"Failed to create course",
         success: false
      }) 
    }
}

//get course by search
export const searchCourse = async (req, res) => {
   try {
      const { query = "", categories = [], sortByPrice = "" } = req.query;

      // Create the search query based on the query and categories
      const searchCriteria = {
         isPublished: true,
         $or: [
           { courseTitle: { $regex: query, $options: "i" } },
           { subTitle: { $regex: query, $options: "i" } },
           { category: { $regex: query, $options: "i" } },
         ],
       };

      // If categories are selected, add to search criteria
      if (categories.length > 0) {
         searchCriteria.category = { $in: categories };
      }

      // Define sorting order for price
      const sortOptions = {};
      if (sortByPrice === "low") {
         sortOptions.coursePrice = 1; // Sort by price in ascending order
      } else if (sortByPrice === "high") {
         sortOptions.coursePrice = -1; // Sort by price in descending order
      }

      // console.log('Search Criteria: ', searchCriteria);
      // console.log('Sort Options:', sortOptions);


      // Fetch courses from the database
      let courses = await Course.find(searchCriteria)
         .populate({ path: "creator", select: "name photoUrl" })
         .sort(sortOptions);
      
      return res.status(200).json({
         courses: courses || [],
         message: "Courses fetched successfully",
         success: true,
         searchCriteria
      });

   } catch (error) {
      console.log(error);
      return res.status(500).json({
         success: false,
         message: "Something went wrong",
      });
   }
};

//Business logic to fetch all the published courses

export const getPublishedCourse = async(_,res)=>{
   try{
     const courses = await Course.find({isPublished:true}).populate({path:"creator",select:"name photoUrl"});

     if(!courses){
       return res.status(404).json({
          success:false,
          message:"Courses not found"
       })
     }
     
     //console.log("Published courses from backend are : ",courses);
     

     return res.status(200).json({
         courses,
         message:"Published courses fetched successfully",
         success: true
     })

   } catch(error){
      console.log(error);
      return res.status(500).json({
         message:"Failed to get published courses",
         success: false
      }) 
   }
}

//get all courses of an instructor

export const getCreatorCourses = async(req,res)=>{
   try{
     const userId = req.id;
     const courses = await Course.find({creator:userId})

     if(!courses){
      return res.status(404).json({
          courses: [],
          message:"Courses not found",
          success: false
      })
     }

     return res.status(200).json({
       courses,
       message:"Courses fetched successfully",
       success: true
     })
      
   } catch(error){
      console.log(error);
      return res.status(500).json({
         message:"Failed to fetch course",
         success: false
      }) 
   }
}

//update courses

export const editCourse = async(req,res)=>{
   try{
     const courseId = req.params.courseId; 
     const {courseTitle, subtitle , description , category , courseLevel, coursePrice} = req.body;
     const thumbnail = req.file;
     
     let course = await Course.findById(courseId);

     if(!course){
      return res.status(404).json({
         success:false,
         message:"Course not found"
      })
     }

     //delete the old thumbnail if it is already present
     let courseThumbnail;
     if(thumbnail){
       //public id nikalenge
       if(course.courseThumbnail){
         const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
         await deleteMediaFromCloudinary(publicId); //delete old image from cloudinary
       }
       //upload a thumbnail on cloudinary
       courseThumbnail= await uploadMedia(thumbnail.path);
     }

     const updatedData = {
       courseTitle,
       subtitle,
       description,
       category,
       courseLevel,
       coursePrice,
       courseThumbnail: courseThumbnail?.secure_url
     }

     course = await Course.findByIdAndUpdate(courseId,updatedData,{new:true});
     
     return res.status(200).json({
       course,
       message:"Course updated successfully",
       success: true
     })
      
   } catch(error){
      console.log(error);
      return res.status(500).json({
         message:"Failed to update course",
         success: false
      }) 
   }
}

//get course by Id 

export const getCourseById = async(req,res)=>{
   try{
     const courseId = req.params.courseId;

     const course = await Course.findById(courseId);

     if(!course){
       return res.status(404).json({
          success:false,
          message:"Course not found"
       })
     }

     return res.status(200).json({
        course,
        success: true,
        message:"Course fetched successfully by id"

     })

   } catch(error){
      console.log(error);
      return res.status(500).json({
         message:"Failed to get course by id",
         success: false
      }) 
   }
}

// **********************Business logic for lectures start from here *******************

export const createLecture = async(req,res)=> {
   try{
     const {lectureTitle} = req.body;
     const {courseId}= req.params;

     if(!lectureTitle || !courseId){
       return res.status(400).json({
          success:false,
          message:"Lecture title is required"
       })
     }
     
     //create lecture
     const lecture = await Lecture.create({lectureTitle});

     //get course
     const course = await Course.findById(courseId);

     if(course){
       course.lectures.push(lecture._id);
       await course.save();
     }

     return res.status(201).json({
       lecture,
       message:"Lecture created successfully",
       success: true
     });

      
   } catch(error){
      console.log(error);
      return res.status(500).json({
         message:"Failed to create lecture",
         success: false
      }) 
   }
}

export const getCourseLecture = async(req,res)=> {
   try{
     const {courseId} = req.params;
     const course = await Course.findById(courseId).populate("lectures");

     if(!course){
      return res.status(404).json({
          success:false,
          message:"Course not found"
      })
     }

     return res.status(200).json({
       lectures: course.lectures,
       message:"Lectures fetched successfully",
       success: true
     })

   } catch(error){
      console.log(error);
      return res.status(500).json({
         message:"Failed to fetch lecture",
         success: false
      }) 
   }
}

export const editLecture = async(req,res)=>{
   try{
     const {lectureTitle,videoInfo, isPreviewFree} = req.body;
     
     //videoUrl and publicId would be obtained from cloudinary
     
     const {courseId, lectureId}= req.params;
     const lecture = await Lecture.findById(lectureId);
     if(!lecture){
      return res.status(404).json({
          success:false,
          message:"Lecture not found"
      })
     }

     //update lecture
     if(lectureTitle){
       lecture.lectureTitle= lectureTitle;
     }

     if(videoInfo?.videoUrl){
       lecture.videoUrl = videoInfo.videoUrl;
     }

     if(videoInfo?.publicId){
       lecture.publicId = videoInfo.publicId;
     }

     
      lecture.isPreviewFree = isPreviewFree;

     //save the lecture
     await lecture.save();

     //Ensure the course still has the lecture id if it was not already there .
     const course = await Course.findById(courseId);

     if(course && !course.lectures.includes(lecture._id)){
         course.lectures.push(lecture._id);
         await course.save();
     }

     return res.status(200).json({
       message:"Lecture updated successfully",
       success: true,
       lecture
     })

   } catch(error){
      console.log(error);
      return res.status(500).json({
         message:"Failed to edit lectures",
         success: false
      }) 
   }
}

//remove lecture
export const removeLecture = async(req,res)=>{
   try{
     const {lectureId}= req.params;
     const lecture = await Lecture.findByIdAndDelete(lectureId);
     if(!lecture){
      return res.status(404).json({
         success:false,
         message:"Lecture not found!"
      })
     }

     //delete the lecture from cloudinary

     if(lecture.publicId){
      await deleteVideoFromCloudinary(lecture.publicId);
     }

     //remove the lecture from course 
     await Course.updateOne({lectures:lectureId}, //find the course that contains the individual lecture
      {$pull:{lectures:lectureId}}); //remove the lecture id from lectures array in the course 
     
      return res.status(200).json({
         message:"Lecture removed successfully",
         success: true
      })
      
   } catch(error){
      console.log(error);
      return res.status(500).json({
         message:"Failed to remove lecture",
         success: false
      }) 
   }
}

export const getLectureById = async(req,res)=>{
   try{
     const {lectureId} = req.params;

     const lecture = await Lecture.findById(lectureId);
     if(!lecture){
      return res.status(404).json({
         success:false,
         message:"Lecture not found!"
      })
     }

     return res.status(200).json({
         success:true,
         message:"Lecture fetched successfully",
         lecture 
     })

   } catch(error){
      console.log(error);
      return res.status(500).json({
         message:"Failed to fetch lecture by id",
         success: false
      }) 
   }
}

//Publish and Unpublish course Logic

export const togglePublishCourse = async(req,res)=>{
   try{
     const {courseId}= req.params;
     const {publish}= req.query; //true or false

     const course = await Course.findById(courseId);
       if(!course){
         return res.status(404).json({
          success:false,
          message:"Course not found!"
         })
       }

       //publish status based on the query parameter
       course.isPublished = publish==="true" ;
       await course.save();
       
       const statusMessage = course.isPublished ? "Published" : "Unpublished";
       return res.status(200).json({
          success:true,
          message: `Course is successfully ${statusMessage}`
       })

   } catch(error){
      console.log(error);
      return res.status(500).json({
         message:"Failed to update status",
         success: false
   })

   }

}


