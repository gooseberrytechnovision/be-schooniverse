import { ApiProperty } from '@nestjs/swagger';

export class GetPaymentConfigDto {
  @ApiProperty({ description: 'Environment' })
  env: string;

  @ApiProperty({ description: 'Authentication details' })
  auth: {
    client_id: string;
    client_secret: string;
    api_key: string;
  };

  @ApiProperty({ description: 'Student ID' })
  student_id: string;

  @ApiProperty({ description: 'Application code' })
  application_code: string;

  @ApiProperty({ description: 'Fee headers' })
  fee_headers: {
    current_payable: number;
  };

  @ApiProperty({ description: 'Payment provider configuration' })
  pp_config: {
    slug: string;
  };

  @ApiProperty({ description: 'Student details' })
  student_details: {
    student_first_name: string;
  };

  @ApiProperty({ description: 'Customer/Parent details' })
  customer_details: {
    customer_first_name: string;
    customer_email: string;
  };
}
