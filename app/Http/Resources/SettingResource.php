<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SettingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'key'          => $this->key,
            'value'        => $this->value,
            'display_name' => $this->display_name,
            'group'        => $this->group,
            'type'         => $this->type,
        ];
    }
}

