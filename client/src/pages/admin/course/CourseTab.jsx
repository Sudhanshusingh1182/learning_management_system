import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/components/RichTextEditor";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {useEditCourseMutation, useGetCourseByIdQuery, usePublishCourseMutation } from "@/features/api/courseApi";
import { toast } from "sonner";

const courseTab = () => {

  const [input, setInput] = useState({
    courseTitle: "",
    subTitle: "",
    description: "",
    category: "",
    courseLevel: "",
    coursePrice: "",
    courseThumbnail: "",
  });

  const params = useParams();
  const courseId = params.courseId;

  const {data:courseByIdData, isLoading:courseByIdLoading, refetch}= useGetCourseByIdQuery(courseId, {refetchOnMountOrArgChange:true});
  
  const [publishCourse, {}]= usePublishCourseMutation();

  useEffect(()=>{
     if(courseByIdData?.course){
        const course = courseByIdData?.course;
        setInput({
            courseTitle: course.courseTitle,
            subTitle: course.subTitle,
            description: course.description,
            category: course.category,
            courseLevel: course.courseLevel,
            coursePrice: course.coursePrice,
            courseThumbnail: "",
        })
     }
  },[courseByIdData])

  const [previewThumbnail, setPreviewThumbnail] = useState("");

  const navigate = useNavigate();

  const [editCourse, {data, isLoading, isSuccess, error}] = useEditCourseMutation();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const selectCategory = (value) =>{
    setInput({...input,category:value})
  }

  const selectCourseLevel = (value) =>{
    setInput({...input,courseLevel:value})
  }

  //get file 
  const selectThumbnail = (e) =>{
    const file = e.target.files?.[0];
    if(file){
      setInput({...input,courseThumbnail:file});
      //Using file reader to show preview of the image selected
      const fileReader = new FileReader(); 
      fileReader.onloadend = () => {
         setPreviewThumbnail(fileReader.result);
      }
      fileReader.readAsDataURL(file);
    }
  }

  const updateCourseHandler = async() => {
      const formData = new FormData();
      formData.append("courseTitle",input.courseTitle);
      formData.append("subTitle",input.subTitle);
      formData.append("description",input.description);
      formData.append("category",input.category);
      formData.append("courseLevel",input.courseLevel);
      formData.append("coursePrice",input.coursePrice);
      formData.append("courseThumbnail",input.courseThumbnail);
      await editCourse({formData, courseId});
  }

  const publishStatusHandler =  async(action) =>{
       try{
          const response = await publishCourse({courseId,query:action});
          if(response.data){
            refetch(); 
            toast.success(response.data.message);
          }
          
          
       } catch(error){
           toast.error("Failed to change the status of the course");
       }

  }

  useEffect(()=>{
     if(isSuccess){
        toast.success(data.message || "Course updated successfully");
     }

     if(error){
        toast.error(error.data.message || "Failed to update course");
     }
  },[isSuccess,error]);

  if(courseByIdLoading){
     return <Loader2 className="h-4 w-4 animate-spin" />
  }

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between">
        <div>
          <CardTitle>Basic Course Information</CardTitle>
          <CardDescription>
            Make changes to your courses here. Click save when you're done.
          </CardDescription>
        </div>
        <div className="space-x-2 ">
          <Button disabled={courseByIdData?.course.lectures.length ===0} variant="outline" onClick={()=> publishStatusHandler(courseByIdData?.course.isPublished ? "false" : "true" )} >
            {courseByIdData?.course.isPublished ? "Unpublish" : "Publish"}
          </Button>

          <Button>Remove Course</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mt-5">
          <div>
            <Label>Title</Label>
            <Input
              type="text"
              name="courseTitle"
              value={input.courseTitle}
              onChange={changeEventHandler}
              placeholder="Ex. Fullstack Development "
            />
          </div>
          <div>
            <Label> Subtitle</Label>
            <Input
              type="text"
              value={input.subTitle}
              onChange={changeEventHandler}
              name="subTitle"
              placeholder="Ex. Become a fullstack developer from zero to hero in 2 months. "
            />
          </div>

          <div>
            <Label>Description</Label>
            <RichTextEditor input={input} setInput={setInput} />
          </div>
          <div className="flex items-center gap-5">
            <div>
              <Label>Category</Label>
              <Select onValueChange={selectCategory} >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Category</SelectLabel>
                    <SelectItem value="Next JS">Next JS</SelectItem>
                    <SelectItem value="Data Science">Data Science</SelectItem>
                    <SelectItem value="Frontend Development">
                      Frontend Development
                    </SelectItem>
                    <SelectItem value="Fullstack Development">
                      Fullstack Development
                    </SelectItem>
                    <SelectItem value="MERN stack Development">
                      MERN stack Development
                    </SelectItem>
                    <SelectItem value="Backend Development">
                      Backend Development
                    </SelectItem>
                    <SelectItem value="JavaScript">JavaScript</SelectItem>
                    <SelectItem value="Python">Python</SelectItem>
                    <SelectItem value="Docker">Docker</SelectItem>
                    <SelectItem value="Java">Java </SelectItem>
                    <SelectItem value="MongoDB">MongoDB </SelectItem>
                    <SelectItem value="HTML">HTML </SelectItem>
                    <SelectItem value="Data structure and algorithm">
                      Data structure and algorithm{" "}
                    </SelectItem>
                    <SelectItem value="Competitive Programming">
                      Competitive Programming{" "}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Course Level</Label>
              <Select onValueChange={selectCourseLevel} >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a course level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Course Level</SelectLabel>
                    
                    <SelectItem value="Beginner">Beginner </SelectItem>
                    <SelectItem value="Intermediate">Intermediate </SelectItem>
                    <SelectItem value="Advanced">Advanced </SelectItem>
                    
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div>
               <Label>Price (in INR)</Label>
               <Input
                  type="number"
                  name="coursePrice"
                  value={input.coursePrice}
                  onChange={changeEventHandler}
                  placeholder="199"
                  className='w-fit'
               />
            </div>

          </div>
          <div>
                <Label>Course Thumbnail</Label>
                <Input 
                  type='file'
                  onChange= {selectThumbnail}
                  accept='image/*'
                  className='w-fit'
                />
                {
                   previewThumbnail && (
                     <img src={previewThumbnail} className="w-64  my-2 " alt="Course Thumbnail" />
                   ) 
                }
            </div>

            <div className="space-x-2" >
                <Button variant="outline" onClick= {()=>navigate("/admin/course")} >Cancel</Button>
                <Button disabled= {isLoading} onClick= {updateCourseHandler} >
                   {
                    isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Please wait
                        </>
                    ) : "Save"
                   }

                </Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default courseTab;