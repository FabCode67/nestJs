
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    Matches,
    MinLength,
    IsEnum,
    
} from 'class-validator';

const passwordRegEx =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

export class CreateUserDto {
    @IsString()
    @MinLength(2, { message: 'Name must have atleast 2 characters.' })
    @IsNotEmpty()
    fullName: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsEnum(['User', 'Admin'])
    @IsNotEmpty()
    roles: string[];

    @IsString()
    @Matches(passwordRegEx, {
        message: 'Password is too weak. It must contain atleast 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character.',
    })
    @IsNotEmpty()
    password: string;
}
