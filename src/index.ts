import express,{Request,Response} from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const app=express()
app.listen(3000)
const secretKey="Helloworld"
app.use(express.json())
//Basic Todo Crud Operations 
app.post('/api/v1/user/signUp',async(req:Request,res:Response)=>{
    try {
        const {email,name,password}=req.body
        const existingUsers=await prisma.user.findUnique({where:{email:email}})
        if(existingUsers) {
            res.status(203).json({message:"User not found"})
        }
        const hashedPass=await bcrypt.hash(password,12)
        const newUser=await prisma.user.create({
            data:{name:name,email:email,password:hashedPass}
        })

        res.status(200).json({message:"User Created",success:true})
    } catch (error) {
        res.status(500).json({error:error})
        console.log(error)
    }
})

app.post('/api/v1/user/login',async(req:Request,res:Response)=>{
    try {
        const {email,password}=req.body

        const existingUser=await prisma.user.findUnique({where:{email:email}})
        if(!existingUser){
            res.status(400).json({message:'User not Found'})
        return;
        }
        const passwordCheck=await bcrypt.compare(existingUser.password,password)
        if(!passwordCheck) {
            res.status(400).json({message:'Wrong Password'})
        return;
        }
        const token=jwt.sign({id:existingUser.id},secretKey,{expiresIn:'8h'})

        res.cookie('token',token)
        res.status(200).json({message:"User login successfully",success:true})


    } catch (error) {
        res.status(500).json({error:error})
        console.log(error)
    }
})

app.get('/api/v1/users',async(req:Request,res:Response)=>{
    try {
        const allUsers=await prisma.user.findMany()

        res.status(200).json({allUsers,success:true})
    } catch (error) {
        res.status(500).json({error:error})
        console.log(error)
    }
})

app.get('/api/v1/todos',async (req:Request,res:Response) => {
    try {
        const userId=req.body.userId
        const todos=await prisma.todo.findMany({where:{userId:userId}})

        res.status(200).json({todos:todos})
    } catch (error) {
        res.status(500).json({error:error})
        console.log(error)
    }
})


app.post('/api/v1/todo',async (req:Request,res:Response) => {
    try {
        const {content,title,userId}=req.body
        const newTodo=await prisma.todo.create({
            data:{
                title:title,
                content:content,
                completed:false,
                userId:userId   
            }
        })
        res.status(200).json({message:"Todo Created",todo:newTodo})
    } catch (error) {
        res.status(500).json({error:error})
        console.log(error)
    }
})

app.get('/api/v1/todo',async (req:Request,res:Response) => {
    try {
        const {userId}=req.body
        const todos=await prisma.todo.findMany({
            where:{userId:userId}
        })

        res.status(200).json({todos})
    } catch (error) {
        res.status(500).json({error:error})
        console.log(error)
    }
})

app.put('/api/v1/todo',async (req:Request,res:Response) => {
    try {
        const {completed,id,userId}=req.body
        const todo=await prisma.todo.update({
            where:{id},data:{
                completed:completed
            }
        })


        res.status(200).json({message:"Update done",todo})
    } catch (error) {
        res.status(500).json({error:error})
        console.log(error)
    }
})


app.delete('/api/v1/todo',async (req:Request,res:Response) => {
    try {
        const {content}=req.body
        const todo=await prisma.todo.findFirst({
            where: { content:content }
          }); 

          if (!todo) {
             res.status(404).json({ error: 'Todo not found' });
            return
            }
          await prisma.todo.delete({
            where:{id:todo.id}
          })
        res.status(200).json({message:"Delete done"})
    } catch (error) {
        res.status(500).json({error:error})
        console.log(error)
    }
})


