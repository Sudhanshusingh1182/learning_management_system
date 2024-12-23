import { Course } from "../models/course.model.js";
import { CourseProgress } from "../models/courseProgress.model.js";

export const getCourseProgress = async (req,res)=>{
    try {
        const {courseId}= req.params;
        const userId = req.id;

        //step-1 : Fetch the user course progress 
        let courseProgress = await CourseProgress.findOne({courseId,userId}).populate("courseId");
        const courseDetails = await Course.findById(courseId).populate("lectures");

        if(!courseDetails){
            return res.status(404).json({
                success:false,
                message:"Course not found"
            })
        }

        //step-2 : If no progress found, return course details with an empty progress

        if(!courseProgress){
            return res.status(200).json({
                success:true,
                message:"Course progress fetched successfully with empty progress",
                data:{
                    courseDetails,
                    progress:[],
                    completed:false
                }
            })
        }

        //step-3 : Return the user's course progress along with course details
        return res.status(200).json({
            success:true,
            message:"Course progress fetched successfully",
            data:{
                courseDetails,
                progress:courseProgress.lectureProgress,
                completed:courseProgress.completed
            }
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to get course progress"
        })
        
    }
}

export const updateLectureProgress = async(req,res)=>{
    try{
      const {courseId,lectureId}= req.params;
      const userId = req.id;

      //fetch or create course progress
      let courseProgress = await CourseProgress.findOne({courseId,userId});

      if(!courseProgress){
        //If no progress exists, create a new record
        courseProgress = new CourseProgress({
            userId,
            courseId,
            completed:false,
            lectureProgress:[]
        });
        
      }

        //find the lecture progress in the course progress
        const lectureIndex = courseProgress.lectureProgress.findIndex((prog)=> prog.lectureId === lectureId);
        
        if(lectureIndex !== -1){
            //If lecture already exists, then update its status
            courseProgress.lectureProgress[lectureIndex].viewed = true;
        } else{
            //If lecture doesn't exist , add new lecture progress
            courseProgress.lectureProgress.push({
                lectureId,
                viewed:true
            });
        }

        //if all lectures are completed, mark the course as completed
        const lectureProgressLength = courseProgress.lectureProgress.filter((lectureProg)=> lectureProg.viewed).length; 
        
        const course = await Course.findById(courseId);
        
        if(course.lectures.length === lectureProgressLength){
            courseProgress.completed = true;
        }

        await courseProgress.save();

        return res.status(200).json({
            message:"Lecture progress updated successfully",
            success:true
        })

    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to update lecture progress"
        })
        
    }
}

export const markAsCompleted = async(req,res)=>{
    try {
        const {courseId}= req.params;
        const userId = req.id;

        const courseProgress = await CourseProgress.findOne({courseId,userId});

        if(!courseProgress){
            return res.status(404).json({
                success:false,
                message:"Course progress not found"
            })
        }

        courseProgress.lectureProgress.map((lectureProgress)=> lectureProgress.viewed = true);
        courseProgress.completed = true;
        await courseProgress.save();

        return res.status(200).json({
            message:"Course marked as completed",
            success:true
        })

    } catch (error) {
        console.log(error);
        
    }
}

export const markAsInCompleted = async(req,res)=>{
    try {
        const {courseId}= req.params;
        const userId = req.id;

        const courseProgress = await CourseProgress.findOne({courseId,userId});

        if(!courseProgress){
            return res.status(404).json({
                success:false,
                message:"Course progress not found"
            })
        }

        courseProgress.lectureProgress.map((lectureProgress)=> lectureProgress.viewed = false);
        courseProgress.completed = false;
        await courseProgress.save();

        return res.status(200).json({
            message:"Course marked as incompleted",
            success:true
        })

    } catch (error) {
        console.log(error);
        
    }
}