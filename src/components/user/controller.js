import { PrismaClient } from "@prisma/client";
import Pusher from "pusher";

const pusher = new Pusher({
    appId:"1481306",
    key: "e2d15ca3b72fc61fa8cb",
    secret: "3998a8ddbe3fce43a744",
    cluster: "us2",
    useTLS: true
});

const prisma = new PrismaClient();

export const findAll = async (req,res) =>{
    try{
        const users = await prisma.user.findMany({
            where: { id: { not: Number(req.params.id) } },
        });

        res.json({
            ok:true,
            data:users,
        });
    }catch (error) {
        return res.status(500).json({
            ok:false,
            data: error.message,
        })
    }
};

const findOne = async (email) => {
    try{
        return await prisma.user.findFirst({ where: { email }});
    } catch (error){
        return null;
    }
};

export const store = async (req,res) => {
    try {
        const { body } = req;

        const userByEmail = await findOne(body.email);

        if(userByEmail) {
            return res.json({
                ok: true,
                data : userByEmail,
            });
        }
    
        body.profile_url = `https://avatars.dicebear.com/api/avataaars/${body.name}.svg`;

        const user = await prisma.user.create({
            data: {
                ...body,
            },
        });

        pusher.trigger("my-chat", "my-list-contacts", {
            message: "Call up to update list contacs"
        });
        
        res.status(201).json({
            ok:true,
            data: user,
        });


    }catch(error){
        return res.status(500).json({
            ok:false,
            data:error.message,
        });
    }
};