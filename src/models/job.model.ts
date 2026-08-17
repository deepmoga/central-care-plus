export interface Job {
    id: number;
    service_date: string;          // YYYY-MM-DD
    service_start_time: string;    // HH:mm
    service_end_time: string;      // HH:mm
    carer_id: number;
    clock_in: string | null;
    clock_out: string | null;
    status_id: number;
    service_name: string;
    client_name: string;
    family_name: string;
    client_company_id: number;
    client_company_name: string;
    client_branch_id: number;
    client_branch_name: string;
    profile_photo: string;
    client_company_logo: string;
    table: string;
    status_color: string,
    status_title: string,
    carer_user_name: string,
    carer_profile_photo: string
}

export interface JobDetail {
    id: number;
    apply_schedule: number;
    branch_name: string;
    carer_id: number;
    client_address: string;
    client_email: string;
    client_name: string;
    client_phone: string;
    client_id: number;
    clock_in: string;
    clock_in_date: string | null;
    clock_out: string;
    clock_out_date: string | null;
    comment: string;
    client_company_id: number;
    company_logo: string;
    company_name: string;
    instructions: string;
    family_name: string;
    location_in: string;
    location_out: string | null;
    outing_kms: number | null;
    private_kms: number | null;
    profile_photo: string;
    service_date: string;
    service_end_time: string;
    service_name: string;
    service_start_time: string;
    signature: string;
    is_signature: number;
    status_id: number;
    status_color: string,
    status_title: string,
    table: string;
    task_list: [],
    client_documents: { doc_name: string; doc_file: string }[];
    carer_user_name: string,
    carer_profile_photo: string,
    is_log_filled: number;
    sign_last_date: string;
}
